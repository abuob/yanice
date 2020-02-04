import { IncomingMessage, ServerResponse } from 'http';
import { IYaniceArgs } from '../config/args-parser';
import { IYaniceConfig } from '../config/config-parser';
import { IDirectedGraph } from '../dep-graph/directed-graph';
import { FindFileUtil } from '../util/find-file';
import { log } from '../util/log';
import { GraphDagreRenderer } from './graph-dagre-renderer';
import { GraphDotRenderer } from './graph-dot-renderer';

const fs = require('fs');
const path = require('path');
const http = require('http');
const open = require('open');

export class DepGraphVisualizationServer {
    public static serveDagreGraph(
        depGraph: IDirectedGraph,
        yaniceConfig: IYaniceConfig,
        yaniceArgs: IYaniceArgs,
        affectedProjects: string[],
        changedFiles: string[]
    ): void {
        const templateHtml = DepGraphVisualizationServer.getTemplateHtml();
        const graphData = GraphDagreRenderer.getGraphData(depGraph, yaniceConfig, yaniceArgs, affectedProjects, changedFiles);
        const actualHtml = templateHtml.replace('INSERT-GRAPH-DATA-STRINGIFIED-HERE', JSON.stringify(graphData));
        DepGraphVisualizationServer.startServer(actualHtml);
    }

    public static serveDotVizJsGraph(depGraph: IDirectedGraph): void {
        const templateHtml =
            '<!DOCTYPE html><meta charset="utf-8"><body> <script src="https://d3js.org/d3.v4.min.js"></script> <script src="https://unpkg.com/viz.js@1.8.1/viz.js" type="javascript/worker"></script> <script src="https://unpkg.com/d3-graphviz@2.6.1/build/d3-graphviz.js"></script> <div id="graph" style="text-align: center;"></div> <script>d3.select("#graph").graphviz().fade(false).renderDot(\'INSERT_DOT_REPRESENTATION_OF_GRAPH_HERE\');</script>';
        const actualHtml = templateHtml.replace('INSERT_DOT_REPRESENTATION_OF_GRAPH_HERE', GraphDotRenderer.getDotRepresentation(depGraph));
        DepGraphVisualizationServer.startServer(actualHtml);
    }

    private static startServer(servedHtml: string): void {
        const server = http.createServer((request: IncomingMessage, response: ServerResponse): void => {
            response.writeHead(200, { 'Content-Type': 'text/html' });
            response.end(servedHtml);
        });

        server.listen(4567, '127.0.0.1');

        log('Visualized graph can be seen at: http://localhost:4567');
        open('http://localhost:4567');
    }

    private static getTemplateHtml(): string {
        const templateHtmlPath = FindFileUtil.findFileInParentDirsFromInitialDir('graph-display-template.html', __dirname);
        if (!templateHtmlPath) {
            throw new Error('Could not find graph-display-template.html to construct graph visualization, abort!');
        }
        return fs.readFileSync(path.resolve(templateHtmlPath)).toString();
    }
}
