import { Logger } from "@nestjs/common";
import { Interaction, OriginInteraction } from "src/track/track/model/client.interaction";
import { ClientTrack } from "src/track/track/model/client.track";
import { TrackService } from 'src/track/track/track.service';
import * as WebSocket from 'ws';


export class ClientBroker {
  private readonly logger = new Logger(ClientBroker.name);

  remoteClient: any;
  remoteServer: any;
  clientTrack: ClientTrack;
  isReady: boolean;
  isTerminated: boolean = false;

  constructor(remoteClient: any, remoteServerURL: string, clientTrack: ClientTrack, private readonly trackService: TrackService) {

    this.remoteClient = remoteClient;
    this.clientTrack = clientTrack;
    this.isReady = false;
    this.createRemoteServer(remoteServerURL);


    this.remoteClient.on("message", async (data) => {
      let _data;
      try {
        _data = JSON.parse(data);
      } catch (e) {
        _data = data;
      }

      this.clientTrack.interaction.push(new Interaction(OriginInteraction.CLIENT, _data));
      if (this.remoteServer.readyState === WebSocket.OPEN) {
        this.remoteServer.send(data);
      }
      await this.trackService.updateTrack(this.clientTrack)
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
        if(!this.isTerminated)
        this.createRemoteServer(remoteURL);
      }, 1000)

    })

    this.remoteServer.on("message", async (data) => {
      if(!this.isReady) {
        return;
      }
      this.remoteClient.emit("message", data);
      const jsonData = JSON.parse(data);
      this.clientTrack.interaction.push(new Interaction(OriginInteraction.SERVER, jsonData))
    })

    this.remoteServer.on("open", async () => {
      
      this.logger.log(`established connection between client ${this.remoteClient.id} with trackid: ${this.clientTrack.tid} and nodeRED`);

      if (this.clientTrack.interaction.length > 0) {
        this.isReady = false;
        this.logger.log('resync client with nodeRED');
        const clientMessages = this.clientTrack.interaction.filter(d => d.origin == OriginInteraction.CLIENT).map(d => d.data);
        
        let interval = 50;
        clientMessages.forEach((data, index, array) => {
          setTimeout(() => {
            this.remoteServer.send(JSON.stringify(data));
            if (index === array.length -1){
              this.isReady = true;
            };
        }, interval+=50);
        })

        this.logger.log('resync client finished')

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

  public async terminate(){
    this.remoteServer.removeEventListener("open");
    this.remoteServer.removeEventListener("error");
    this.remoteServer.removeEventListener("close");
    this.remoteServer.removeEventListener("message");
    this.isTerminated = true;
    setTimeout(() => {
      this.remoteServer.close();
    }, 20);
  }
}