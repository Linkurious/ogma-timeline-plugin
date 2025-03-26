import "vis-timeline";

declare module "vis-timeline" {
  interface Graph2d {
    linegraph: {
      groups: Record<
        string,
        {
          itemsData: {
            screen_x: number;
            screen_y: number;
            x: Date;
            width: number;
          }[];
        }
      >;
    };
  }
}
