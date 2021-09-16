import { All, Controller, Get, Req, Res } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

var httpProxy = require('http-proxy');

@ApiTags('red')
@Controller('red')
export class NoderedController {
    private proxy;

    constructor() {
        this.proxy = httpProxy.createProxyServer();
    }
    @All()
    proxyForward(@Req() req, @Res() res) {
        const url = req.originalUrl.replace('/red/red/', '/red/');
        console.log(url)
        this.proxy.web(req, res, { 
            target: `http://localhost:1880${url}` });
    }
}
