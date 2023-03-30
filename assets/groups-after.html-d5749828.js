import{_ as t,p as e,q as o,a1 as d}from"./framework-5866ffd3.js";const n={},a=d("<p>const ogma = new Ogma({ container: &quot;ogma&quot;, graph: { nodes: [ ...new Array(8).fill(0).map((<em>, id) =&gt; ({ id, data: { type: &quot;car&quot;, start: new Date(<code>1 1 ${1950 + id}</code>) }, })), ...new Array(8).fill(0).map((</em>, id) =&gt; ({ id: 8 + id, data: { type: &quot;person&quot;, start: new Date(<code>1 6 ${1950 + id}</code>) }, })), ], edges: [], }, }); ogma.styles.addNodeRule((node) =&gt; node.getData(&quot;type&quot;) === &quot;car&quot;, { color: &quot;#f80&quot;, text: { content: (node) =&gt; <code>car ${node?.getId()}</code>, size: 20, }, }); ogma.styles.addNodeRule((node) =&gt; node.getData(&quot;type&quot;) === &quot;person&quot;, { color: &quot;#08f&quot;, text: { content: (node) =&gt; <code>person ${node?.getId()}</code>, size: 20, }, });</p><p>ogma.layouts.force({ locate: { padding: 200 }, });</p><p>const controller = new Controller(ogma, document.getElementById(&quot;timeline&quot;), { filter: { enabled: true, strategy: &quot;outisde&quot;, tolerance: &quot;strict&quot;, }, timeline: { groupIdFunction: (nodeId) =&gt; (ogma.getNode(nodeId) as Node).getData(&quot;type&quot;), itemGenerator: (nodeId) =&gt; { const node = ogma.getNode(nodeId) as Node; return { content: <code>${node?.getData(&quot;type&quot;)} ${node.getId()}</code> }; }, }, barchart: { groupIdFunction: (nodeId) =&gt; (ogma.getNode(nodeId) as Node).getData(&quot;type&quot;), graph2dOptions: { legend: true, }, }, start: new Date(&quot;1 1 1949&quot;), end: new Date(&quot;1 1 1958&quot;), });</p>",3),r=[a];function u(c,g){return e(),o("div",null,r)}const q=t(n,[["render",u],["__file","groups-after.html.vue"]]);export{q as default};
