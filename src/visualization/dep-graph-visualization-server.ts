import { IncomingMessage, ServerResponse } from 'http';
import { FindFileUtil } from '../util/find-file';
import { log } from '../util/log';

const fs = require('fs');
const path = require('path');
const http = require('http');
const open = require('open');

export class DepGraphVisualizationServer {
    public static serveDotRenderedGraph(dotGraphRepresentation: string): void {
        const templateHtmlPath = FindFileUtil.findFileInParentDirsFromInitialDir('graph-display-template.html', __dirname);
        if (!templateHtmlPath) {
            throw new Error('Could not find graph-display-template.html to construct graph visualization, abort!');
        }
        const templateHtml = fs.readFileSync(path.resolve(templateHtmlPath)).toString();
        const actualHtml = templateHtml.replace('INSERT_DOT_REPRESENTATION_OF_GRAPH_HERE', dotGraphRepresentation);

        const server = http.createServer((request: IncomingMessage, response: ServerResponse): void => {
            response.writeHead(200, { 'Content-Type': 'text/html' });
            response.end(actualHtml);
        });

        server.listen(4567, '127.0.0.1');

        log('Visualized graph can be seen at: http://localhost:4567');
        open('http://localhost:4567');
    }
}
