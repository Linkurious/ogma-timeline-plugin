import "./Timeline.css";
import { useEffect, useRef } from "react";
import { useOgma } from "@linkurious/ogma-react";
import { Controller as TimelinePlugin } from "../../src/index";
import ReactDOM from "react-dom";

export default function Timeline() {
  const ogma = useOgma();
  const containerRef = useRef<HTMLDivElement | null>(
    document.createElement("div")
  );
  const timelinePluginRef = useRef<TimelinePlugin | null>(null);

  useEffect(() => {
    if (!containerRef.current || !ogma) return;

    timelinePluginRef.current = new TimelinePlugin(ogma, containerRef.current, {
      minTime: new Date("January 1, 1975 00:00:00").getTime(),
      maxTime: new Date("January 1, 2022 00:00:00").getTime(),
      barchart: {
        nodeGroupIdFunction: (node) => node.getData("type"),

        graph2dOptions: {
          legend: { left: { position: "bottom-left" } },
        },
      },
      timeBars: [
        new Date("January 1, 1975 00:00:00"),
        new Date("January 1, 2025 00:00:00"),
      ],
    });

    return () => {
      if (timelinePluginRef.current) {
        timelinePluginRef.current.destroy();
        timelinePluginRef.current = null;
      }
      if (containerRef.current) {
        containerRef.current.parentNode?.removeChild(containerRef.current);
        containerRef.current = null;
      }
    };
  }, [ogma]);

  // Here we teleport it to annother location in the DOM
  // not to have it inside the Ogma component
  return ReactDOM.createPortal(
    <div ref={containerRef}></div>,
    document.getElementById("timeline-teleport")!
  );
}
