import{_ as o,r,o as l,c as s,a as t,b as e,d,e as i}from"./app-422df3f8.js";const a={},h=i('<h1 id="api" tabindex="-1"><a class="header-anchor" href="#api" aria-hidden="true">#</a> API</h1><h2 id="options" tabindex="-1"><a class="header-anchor" href="#options" aria-hidden="true">#</a> Options</h2><p>Options described here are the options for the controller constructor. Everything you need to customize your timeline happens here.</p><table><thead><tr><th>Name</th><th>Description</th><th>Type</th><th>Default</th></tr></thead><tbody><tr><td>start</td><td>The date from which the timeline will start. If undefined it will take the minimum date from the input nodes/edges</td><td>number | Date</td><td>undefined</td></tr><tr><td>end</td><td>The date from which the timeline will end. If undefined it will take the maximum date from the input nodes/edges</td><td>number | Date</td><td>undefined</td></tr><tr><td>showBarchart</td><td>Whether to show the barchart by default. Has no effect if switchOnZoom is true, as it will pick the most appropriate view depending on the number of elements.</td><td>boolean</td><td>false</td></tr><tr><td>switchOnZoom</td><td>Whether the timeline should automatically switch between barchart and timeline mode during zoom in/out.</td><td>boolean</td><td>true</td></tr><tr><td>nodeStartPath</td><td>The path to retrieve start dates from nodes data. Use dotted notation if it is nested.</td><td>string</td><td>start</td></tr><tr><td>nodeEndPath</td><td>The path to retrieve end dates from nodes data.</td><td>string</td><td>end</td></tr><tr><td>edgeStartPath</td><td>The path to retrieve start dates from edges data.</td><td>string</td><td>start</td></tr><tr><td>edgeEndPath</td><td>The path to retrieve end dates from edges data.</td><td>string</td><td>end</td></tr><tr><td>timebars</td><td>The &quot;blue bars&quot;, shown on the timeline. They are used for filtering. See <a href="#timebar">Timebar</a>.</td><td><a href="#timebar">Timebar</a></td><td>[]</td></tr><tr><td>edgeFilter</td><td>Options for edge filtering. See <a href="#filteroptions">FitlerOptions</a></td><td><a href="#filteroptions">FitlerOptions</a></td><td></td></tr><tr><td>nodeFilter</td><td>Options for node filtering. See <a href="#filteroptions">FitlerOptions</a></td><td><a href="#filteroptions">FitlerOptions</a></td><td></td></tr><tr><td>barchart</td><td>Options for barchart. See <a href="#barchartoptions">barchartOptions</a>.</td><td><a href="#barchartoptions">BarchartOptions</a></td><td></td></tr><tr><td>timeline</td><td>Options for timeline. See <a href="#timelineoptions">timelineOptions</a>.</td><td><a href="#timelineoptions">TimelineOptions</a></td><td></td></tr></tbody></table><h3 id="filteroptions" tabindex="-1"><a class="header-anchor" href="#filteroptions" aria-hidden="true">#</a> FilterOptions</h3><table><thead><tr><th>Name</th><th>Description</th><th>Type</th><th>Default</th></tr></thead><tbody><tr><td>enabled</td><td>Whether the filter is enabled or not.</td><td>boolean</td><td>true</td></tr><tr><td>strategy</td><td>Which strategy to apply for filtering. See <a href="./Filtering">Filtering</a> for further details. Possible values are <code>before</code>, <code>after</code>, <code>between</code>, <code>outside</code></td><td>string</td><td>undefined</td></tr><tr><td>tolerance</td><td>Which tolerance to apply for filtering. See <a href="./Filtering">Filtering</a> for further details. Possible values are <code>strict</code>, <code>loose</code></td><td>string</td><td>loose</td></tr></tbody></table><h3 id="timebar" tabindex="-1"><a class="header-anchor" href="#timebar" aria-hidden="true">#</a> Timebar</h3><p>Timebars can be an object: <code>{ fixed?: boolean; date: Date }</code> a number or a Date. If you specify a number or a date, the timebar will not be fixed.</p><table><thead><tr><th>Name</th><th>Description</th><th>Type</th><th>Default</th></tr></thead><tbody><tr><td>fixed</td><td>Whheter or not the timebar remains at the same position on screen while dragging the timeline.</td><td>boolean</td><td>false</td></tr><tr><td>date</td><td>The date of the timebar</td><td>string</td><td>undefined</td></tr></tbody></table><h3 id="timelineoptions" tabindex="-1"><a class="header-anchor" href="#timelineoptions" aria-hidden="true">#</a> TimelineOptions</h3>',10),u=t("thead",null,[t("tr",null,[t("th",null,"Name"),t("th",null,"Description"),t("th",null,"Type"),t("th",null,"Default")])],-1),c=t("td",null,"nodeGroupIdFunction",-1),p={href:"https://doc.linkurious.com/ogma/latest/api.html#Ogma-transformations-addNodeGrouping",target:"_blank",rel:"noopener noreferrer"},m=t("td",null,"(node: Node) => string",-1),g=t("td",null,[e("node => "),t("code",null,"nodes")],-1),_=t("tr",null,[t("td",null,"nodeGroupContent"),t("td",null,"A function that takes the groupId returned by groupIdFunction, the nodes in the group and returns the title to display for this group in the timeline."),t("td",null,"(groupId: string, nodes: NodeList) => string"),t("td",null,"groupid => groupid")],-1),f=t("td",null,"nodeItemGenerator",-1),b={href:"https://visjs.github.io/vis-timeline/docs/timeline/#Data_Format",target:"_blank",rel:"noopener noreferrer"},v={href:"https://visjs.github.io/vis-timeline/docs/timeline/#Data_Format",target:"_blank",rel:"noopener noreferrer"},O=t("td",null,null,-1),y=t("td",null,"edgeGroupIdFunction",-1),I={href:"https://doc.linkurious.com/ogma/latest/api.html#Ogma-transformations-addNodeGrouping",target:"_blank",rel:"noopener noreferrer"},k=t("td",null,"(edge: Edge) => string",-1),T=t("td",null,[e("edge => "),t("code",null,"edges")],-1),w=t("tr",null,[t("td",null,"edgeGroupContent"),t("td",null,"A function that takes the groupId returned by groupIdFunction, the nodes in the group and returns the title to display for this group in the timeline."),t("td",null,"groupid => groupid"),t("td",null,"start")],-1),D=t("td",null,"edgeItemGenerator",-1),j={href:"https://visjs.github.io/vis-timeline/docs/timeline/#Data_Format",target:"_blank",rel:"noopener noreferrer"},G={href:"https://visjs.github.io/vis-timeline/docs/timeline/#Data_Format",target:"_blank",rel:"noopener noreferrer"},S=t("td",null,null,-1),F=t("td",null,"timelineOptions",-1),N={href:"https://visjs.github.io/vis-timeline/docs/timeline/#Configuration_Options",target:"_blank",rel:"noopener noreferrer"},x={href:"https://visjs.github.io/vis-timeline/docs/timeline/#Configuration_Options",target:"_blank",rel:"noopener noreferrer"},E=t("td",null,null,-1),A=t("h3",{id:"barchartoptions",tabindex:"-1"},[t("a",{class:"header-anchor",href:"#barchartoptions","aria-hidden":"true"},"#"),e(" BarchartOptions")],-1),C=t("thead",null,[t("tr",null,[t("th",null,"Name"),t("th",null,"Description"),t("th",null,"Type"),t("th",null,"Default")])],-1),L=t("tr",null,[t("td",null,"nodeGroupIdFunction"),t("td",null,"Same as in TimelineOptions"),t("td",null,"(nodes: Node) => string"),t("td",null,[e("node => "),t("code",null,"nodes")])],-1),W=t("tr",null,[t("td",null,"nodeGroupContent"),t("td",null,"Same as in TimelineOptions"),t("td",null,"(groupId: string, nodes: NodeList) => string"),t("td",null,"groupid => groupid")],-1),B=t("td",null,"nodeItemGenerator",-1),P={href:"https://visjs.github.io/vis-timeline/docs/graph2d/#items",target:"_blank",rel:"noopener noreferrer"},V={href:"https://visjs.github.io/vis-timeline/docs/graph2d/#items",target:"_blank",rel:"noopener noreferrer"},M=t("td",null,null,-1),q=t("tr",null,[t("td",null,"edgeGroupIdFunction"),t("td",null,"Same as in timelineOptions"),t("td",null,"(edge: Edge) => string"),t("td",null,[e("edge => "),t("code",null,"edges")])],-1),z=t("tr",null,[t("td",null,"edgeGroupContent"),t("td",null,"Same as in timelineOptions"),t("td",null,"groupid => groupid"),t("td")],-1),R=t("td",null,"edgeItemGenerator",-1),Z={href:"https://visjs.github.io/vis-timeline/docs/graph2d/#items",target:"_blank",rel:"noopener noreferrer"},H={href:"https://visjs.github.io/vis-timeline/docs/graph2d/#items",target:"_blank",rel:"noopener noreferrer"},U=t("td",null,null,-1),J=t("td",null,"graph2dOptions",-1),K={href:"https://visjs.github.io/vis-timeline/docs/graph2d/#Configuration_Options",target:"_blank",rel:"noopener noreferrer"},Q={href:"https://visjs.github.io/vis-timeline/docs/graph2d/#Configuration_Options",target:"_blank",rel:"noopener noreferrer"},X=t("td",null,null,-1),Y=i('<h2 id="events" tabindex="-1"><a class="header-anchor" href="#events" aria-hidden="true">#</a> Events</h2><p>The timeline plugin is an event emmitter, to hook to the events it fires, just type <code>plugin.on(myevent, () =&gt; }{})</code></p><table><thead><tr><th>Name</th><th>Description</th><th>Type</th></tr></thead><tbody><tr><td>timechange</td><td>Event triggered when a timebar has changed position. When user drags a timebar for instance.</td><td>void</td></tr><tr><td>select</td><td>Event triggered when selection in the barchart/timeline changes. This event contains the nodes/edges that are related to the selection in the timeline.</td><td>{nodes?: NodeList, edges?: EdgeList, evt: MouseEvent}</td></tr></tbody></table><h2 id="methods" tabindex="-1"><a class="header-anchor" href="#methods" aria-hidden="true">#</a> Methods</h2>',4),$=t("thead",null,[t("tr",null,[t("th",null,"Nameset"),t("th",null,"Description"),t("th",null,"Arguments"),t("th",null,"Returns")])],-1),tt=t("tr",null,[t("td",null,"constructor"),t("td",null,"Creates a new timeline plugin."),t("td",null,[t("a",{href:"#options"},"Options")]),t("td",null,"Controller")],-1),et=t("tr",null,[t("td",null,"showTimeline"),t("td",null,"Displays the timeline instead of the barchart."),t("td",null,"void"),t("td",null,"void")],-1),nt=t("tr",null,[t("td",null,"showBarchart"),t("td",null,"Displays the barchart instead of the timeline."),t("td",null,"void"),t("td",null,"void")],-1),dt=t("tr",null,[t("td",null,"addTimeBar"),t("td",null,"Add a timebar to the timeline."),t("td",null,[t("a",{href:"#timebar"},"timebarOptions")]),t("td",null,"void")],-1),it=t("tr",null,[t("td",null,"removeTimeBar"),t("td",null,"Remove a timebar from the timeline at index i."),t("td",null,"number"),t("td",null,"void")],-1),ot=t("tr",null,[t("td",null,"getTimebars"),t("td",null,"Get all the timebars from the timeline."),t("td",null,"groupid => groupid"),t("td",null,"void")],-1),rt=t("tr",null,[t("td",null,"setTimebars"),t("td",null,"Set timebars for the timeline."),t("td",null,[t("a",{href:"#timebar"},"timebarOptions"),e("[]")]),t("td",null,"void")],-1),lt=t("td",null,"setWindow",-1),st={href:"https://visjs.github.io/vis-timeline/docs/timeline/#Methods",target:"_blank",rel:"noopener noreferrer"},at=t("td",null,"start:number, end: number, options",-1),ht=t("td",null,"void",-1),ut=t("tr",null,[t("td",null,"getWindow"),t("td",null,"Get the start and end dates of the timeline."),t("td",null,"string"),t("td",null,"{start: number; end: number}")],-1),ct=t("tr",null,[t("td",null,"setOptions"),t("td",null,"Set the options for the timeline."),t("td",null,[t("a",{href:"#options"},"Options")]),t("td",null,"void")],-1);function pt(mt,gt){const n=r("ExternalLinkIcon");return l(),s("div",null,[h,t("table",null,[u,t("tbody",null,[t("tr",null,[c,t("td",null,[e("Similar to "),t("a",p,[e("Ogma groups"),d(n)]),e(", pass a function that takes a node as an argument and returns a string representing in which group the node belongs.")]),m,g]),_,t("tr",null,[f,t("td",null,[e("A function that takes a node and its groupid, which returns a "),t("a",b,[e("DataItem"),d(n)]),e(" Object.")]),t("td",null,[e("(node: Node, groupId: string) => "),t("a",v,[e("DataItem"),d(n)])]),O]),t("tr",null,[y,t("td",null,[e("Similar to "),t("a",I,[e("Ogma groups"),d(n)]),e(" , pass a function that takes an edge as an argument and returns a string representing in which group the edge belongs.")]),k,T]),w,t("tr",null,[D,t("td",null,[e("A function that takes an edge and its groupid, which returns a "),t("a",j,[e("DataItem"),d(n)]),e(" Object.")]),t("td",null,[e("(edge: Edge, groupId: string) => "),t("a",G,[e("DataItem"),d(n)])]),S]),t("tr",null,[F,t("td",null,[e("Options to pass to vis-js timeline. See "),t("a",N,[e("Visjs Timeline Options"),d(n)])]),t("td",null,[t("a",x,[e("TimelineOptions"),d(n)])]),E])])]),A,t("table",null,[C,t("tbody",null,[L,W,t("tr",null,[B,t("td",null,[e("A function that takes a nodeList and its groupid, which returns a "),t("a",P,[e("Graph2dItem"),d(n)]),e(" Object.")]),t("td",null,[e("(nodes: NodeList, groupId: string) => "),t("a",V,[e("Graph2dItem"),d(n)])]),M]),q,z,t("tr",null,[R,t("td",null,[e("A function that takes an edgeList and its groupid, which returns a "),t("a",Z,[e("Graph2dItem"),d(n)]),e(" Object.")]),t("td",null,[e("(edges: EdgeList, groupId: string) => "),t("a",H,[e("Graph2dItem"),d(n)])]),U]),t("tr",null,[J,t("td",null,[e("Options to pass to vis-js barchart. See "),t("a",K,[e("Visjs Graph2d Options"),d(n)])]),t("td",null,[t("a",Q,[e("Graph2dOptions"),d(n)])]),X])])]),Y,t("table",null,[$,t("tbody",null,[tt,et,nt,dt,it,ot,rt,t("tr",null,[lt,t("td",null,[e("Set the start and end dates of the timeline. See "),t("a",st,[e("setWindow"),d(n)]),e(" on visjs.")]),at,ht]),ut,ct])])])}const ft=o(a,[["render",pt],["__file","API.html.vue"]]);export{ft as default};
