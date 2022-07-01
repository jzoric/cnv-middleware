import { Logger } from "@nestjs/common";
import { TrackService } from 'src/track/track/track.service';
import * as WebSocket from 'ws';

import { JSONSanitizer } from "src/utils/sanitizer";
import { Interaction, OriginInteraction } from "./client.interaction";
import { ClientTrack } from "./client.track";
import { ClientService } from "src/client/client/client.service";

export class ClientBroker {
  private readonly logger = new Logger(ClientBroker.name);
  private USER_INACTIVE_PERIOD  = 3600000;
  remoteClient: any;
  remoteServer: any;
  clientTrack: ClientTrack;
  isReady: boolean;
  isTerminated: boolean = false;
  inactivityTimeout: NodeJS.Timeout;

  constructor(remoteClient: any, remoteServerURL: string, clientTrack: ClientTrack, private readonly trackService: TrackService, private readonly clientService: ClientService) {

    this.remoteClient = remoteClient;
    this.clientTrack = clientTrack;
    this.isReady = false;
    this.createRemoteServer(remoteServerURL);
    this.inactivityTimeout = setTimeout(() => {
      this.logger.log("User inactive, terminatting");
      this.clientService.handleDisconnect(this.remoteClient)
    }, this.USER_INACTIVE_PERIOD);


    this.remoteClient.on("message", async (data) => {
      let _data;
      try {
        
        _data = JSON.parse(data);
        JSONSanitizer(_data);
      } catch (e) {
        _data = data;
      }

      clearTimeout(this.inactivityTimeout);
      this.inactivityTimeout = setTimeout(() => {
        this.logger.log("User inactive, terminatting");
        this.clientService.handleDisconnect(this.remoteClient)
      }, this.USER_INACTIVE_PERIOD);

      if (this.remoteServer.readyState === WebSocket.OPEN) {
        this.remoteServer.send(JSON.stringify(_data));
      }

      try {
        await this.trackService.addInteraction(this.clientTrack, new Interaction(OriginInteraction.CLIENT, _data))
      } catch (e) {
        this.logger.error(e);
        this.clientService.handleDisconnect(this.remoteClient)
      }
    })
  }

  private createRemoteServer(remoteURL: string) {

    this.remoteServer = new WebSocket(remoteURL);

    this.remoteServer.on("error", async (data) => {
      this.logger.log(`connection ERROR between client ${this.remoteClient.id} with trackid: ${this.clientTrack.tid} and nodeRED`);
      this.remoteServer.removeEventListener("open");
      this.remoteServer.removeEventListener("error");
      this.remoteServer.removeEventListener("close");
      this.remoteServer.removeEventListener("message");

      setTimeout(() => {
        if (!this.isTerminated) {
          this.logger.debug('creating remote server')
          this.createRemoteServer(remoteURL);
        }
      }, 1000)

    })

    this.remoteServer.on("message", async (data) => {
      if (!this.isReady) {
        return;
      }

      const jsonData = JSON.parse(data);
      //JSONSanitizer(jsonData);
      if (jsonData.type === "store") {

        try {
          await this.trackService.updateStore(this.clientTrack, jsonData.data);

        } catch (e) {
          this.logger.error(e);
          this.clientService.handleDisconnect(this.remoteClient)
        }
        return;
      }

      this.remoteClient.emit("message", JSON.stringify(jsonData));

      const interactions = await this.trackService.getInteractions(this.clientTrack);

      // TODO add this feature again calling the bd? 
      const lastObject = interactions[interactions.length - 1];
      if (lastObject?.origin == OriginInteraction.SERVER &&
        JSON.stringify(lastObject.data) == JSON.stringify(jsonData)) {
        return;
      }
      await this.trackService.addInteraction(this.clientTrack, new Interaction(OriginInteraction.SERVER, jsonData))
    })

    this.remoteServer.on("open", async () => {

      this.logger.log(`established connection between client ${this.remoteClient.id} with trackid: ${this.clientTrack.tid} and nodeRED`);

      const interactions = await this.trackService.getInteractions(this.clientTrack);

      if (interactions.length > 0) {
        this.isReady = false;
        this.logger.log('resync client with nodeRED');
        const clientMessages = interactions.filter(d => d.origin == OriginInteraction.CLIENT).map(d => d.data);

        let interval = 600;
        clientMessages.forEach((data, index, array) => {
          setTimeout(() => {
            this.remoteServer.send(JSON.stringify(data));
            if (index === array.length - 1) {
              setTimeout(() => {
                this.isReady = true;

              }, 1000)
              this.logger.log('resync client finished')
            };
          }, interval += 100);
        })
      } else {
        this.isReady = true;
      }


    })

    this.remoteServer.on("close", async (data) => {
      this.logger.log(`connection Closed between client ${this.remoteClient.id} with trackid: ${this.clientTrack.tid} and nodeRED`);

      this.remoteServer.removeEventListener("open");
      this.remoteServer.removeEventListener("error");
      this.remoteServer.removeEventListener("close");
      this.remoteServer.removeEventListener("message");

      setTimeout(() => {

        this.createRemoteServer(remoteURL);
      }, 1000)

    })

  }

  public async terminate() {
    this.remoteServer.removeEventListener("open");
    this.remoteServer.removeEventListener("error");
    this.remoteServer.removeEventListener("close");
    this.remoteServer.removeEventListener("message");
    this.isTerminated = true;
    this.remoteClient.disconnect();
    setTimeout(() => {
      this.remoteServer.close();
    }, 20);
  }
}