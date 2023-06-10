export interface YaniceCustomPluginMandatoryOptions {
    scriptLocation: string;
}

export type YaniceCustomPluginOptions<T> = T & YaniceCustomPluginMandatoryOptions;
