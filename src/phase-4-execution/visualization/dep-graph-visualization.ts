import fs from 'node:fs';
import http from 'node:http';
import path from 'node:path';

import { IncomingMessage, ServerResponse } from 'http';

import { YaniceCliArgsVisualize } from '../../phase-1-config/args-parser/cli-args.interface';
import { YaniceConfig } from '../../phase-1-config/config/config.interface';
import { DirectedGraph } from '../../phase-1-config/directed-graph/directed-graph';
import { FindFileUtil } from '../../util/find-file';
import { log } from '../../util/log';
import { GraphDagreRenderer } from './graph-dagre-renderer';
import { GraphDotRenderer } from './graph-dot-renderer';

export class DepGraphVisualization {
    public static createVisualizationHtml(
        yaniceJsonDirectoryPath: string,
        depGraph: DirectedGraph,
        yaniceConfig: YaniceConfig,
        yaniceCliArgsVisualize: YaniceCliArgsVisualize,
        affectedProjects: string[],
        changedFiles: string[]
    ): string {
        switch (yaniceCliArgsVisualize.renderer) {
            case 'dagrejs':
                return DepGraphVisualization.createDagreVisualizationHtml(
                    yaniceJsonDirectoryPath,
                    depGraph,
                    yaniceConfig,
                    yaniceCliArgsVisualize,
                    affectedProjects,
                    changedFiles
                );
            case 'vizjs':
                return DepGraphVisualization.createVizJsVisualizationHtml(depGraph);
        }
    }

    public static startServer(servedHtml: string, port: number): void {
        const server = http.createServer((_request: IncomingMessage, response: ServerResponse): void => {
            response.writeHead(200, { 'Content-Type': 'text/html' });
            response.end(servedHtml);
        });

        server.listen(port, '127.0.0.1');

        log(`Visualized graph can be seen at: http://localhost:${port}`);
    }

    public static saveTemplateFile(
        yaniceJsonDirectoryPath: string,
        relativeFilePath: string,
        fileName: string,
        templateHtml: string
    ): void {
        const actualFilePath: string = path.join(yaniceJsonDirectoryPath, relativeFilePath, fileName);
        log(`Storing graph visualization in: ${actualFilePath}`);
        fs.mkdirSync(path.dirname(actualFilePath), { recursive: true });
        fs.writeFileSync(actualFilePath, templateHtml);
    }

    private static createDagreVisualizationHtml(
        yaniceJsonDirectoryPath: string,
        depGraph: DirectedGraph,
        yaniceConfig: YaniceConfig,
        yaniceCliArgsVisualize: YaniceCliArgsVisualize,
        affectedProjects: string[],
        changedFiles: string[]
    ): string {
        const templateHtml = DepGraphVisualization.getDagreTemplateHtml();
        const graphData = GraphDagreRenderer.getGraphData(
            yaniceJsonDirectoryPath,
            depGraph,
            yaniceConfig,
            yaniceCliArgsVisualize,
            affectedProjects,
            changedFiles
        );
        const diffTargetInfo: string = yaniceCliArgsVisualize.defaultArgs.diffTarget ?? 'None provided (use e.g. --rev=HEAD)';
        const actualHtml = templateHtml
            .replace('INSERT_GRAPH_DATA_OBJECT_HERE', JSON.stringify(graphData))
            .replace('INSERT_GIT_REVISION', diffTargetInfo)
            .replace('INSERT_SCOPE', yaniceCliArgsVisualize.defaultArgs.scope ?? 'none provided');
        return actualHtml;
    }

    private static createVizJsVisualizationHtml(depGraph: DirectedGraph): string {
        const templateHtml =
            '<!DOCTYPE html><meta charset="utf-8"><body> <script src="https://d3js.org/d3.v4.min.js"></script> <script src="https://unpkg.com/viz.js@1.8.1/viz.js" type="javascript/worker"></script> <script src="https://unpkg.com/d3-graphviz@2.6.1/build/d3-graphviz.js"></script> <div id="graph" style="text-align: center;"></div> <script>d3.select("#graph").graphviz().fade(false).renderDot(\'INSERT_DOT_REPRESENTATION_OF_GRAPH_HERE\');</script>';
        const actualHtml = templateHtml.replace('INSERT_DOT_REPRESENTATION_OF_GRAPH_HERE', GraphDotRenderer.getDotRepresentation(depGraph));
        return actualHtml;
    }

    private static getDagreTemplateHtml(): string {
        const templateHtmlPath = FindFileUtil.findFileInParentDirsRecursively(__dirname, 'graph-display-template.html');
        if (!templateHtmlPath) {
            throw new Error('Could not find graph-display-template.html to construct graph visualization, abort!');
        }
        return fs.readFileSync(path.resolve(templateHtmlPath)).toString();
    }
}
