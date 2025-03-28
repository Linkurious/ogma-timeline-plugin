import "vis-timeline";
type BoxItem = {
  dom?: {
    box: HTMLDivElement;
    line: HTMLDivElement;
    dot: HTMLDivElement;
  };
};
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
  interface Timeline {
    itemSet: {
      groups: Record<
        string,
        {
          items: Record<IdType, BoxItem>;
        }
      >;
      items: Record<IdType, BoxItem>;
    };
  }
}
