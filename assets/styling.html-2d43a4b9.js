import{_ as p,r as o,o as i,c,a as s,b as n,d as t,e as a}from"./app-8a3299c4.js";const l="/ogma-timeline-plugin/no-style-timeline.png",u="/ogma-timeline-plugin/style-barchart.png",r="/ogma-timeline-plugin/style-line.png",d="/ogma-timeline-plugin/style-timeline.png",k={},m=a('<h1 id="styling" tabindex="-1"><a class="header-anchor" href="#styling" aria-hidden="true">#</a> Styling</h1><p>By default the timeline will display every element with the same color:</p><p><img src="'+l+`" alt=""></p><p>Let&#39;s see how to bring some colors into this.</p><h2 id="barchart-styling" tabindex="-1"><a class="header-anchor" href="#barchart-styling" aria-hidden="true">#</a> Barchart styling</h2><p>The simplest way to style barchart is to set <code>fill</code> and <code>stroke</code> properties in CSS:</p><div class="language-css line-numbers-mode" data-ext="css"><pre class="language-css"><code><span class="token selector">.bar-item</span><span class="token punctuation">{</span>
  <span class="token property">stroke</span><span class="token punctuation">:</span> #ff9914<span class="token punctuation">;</span>
  <span class="token property">fill</span><span class="token punctuation">:</span> #ff9914<span class="token punctuation">;</span>
<span class="token punctuation">}</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>Nodes get the <code>node</code> class and edges get the <code>edge</code> class, so if you want to style the bars generated by edges, jut use the selector:</p><div class="language-text line-numbers-mode" data-ext="text"><pre class="language-text"><code>.bar-item.edge{
  stroke: #9914ff;
  fill: #9914ff;
}
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>If you specified a <code>nodeGroupIdFunction</code>, then your groups will have the same class as the id returned by your nodeGroupIdFunction. Let&#39;s say nodeGroupIdFunction returns either <code>car</code> either <code>person</code>, then you can style <code>car</code> and <code>person</code> bars like this</p><div class="language-css line-numbers-mode" data-ext="css"><pre class="language-css"><code><span class="token selector">.bar-item.car</span><span class="token punctuation">{</span>
  <span class="token property">stroke</span><span class="token punctuation">:</span> #ff9914<span class="token punctuation">;</span>
  <span class="token property">fill</span><span class="token punctuation">:</span> #ff9914<span class="token punctuation">;</span>
<span class="token punctuation">}</span>
<span class="token selector">.bar-item.person</span><span class="token punctuation">{</span>
  <span class="token property">stroke</span><span class="token punctuation">:</span> #08f<span class="token punctuation">;</span>
  <span class="token property">fill</span><span class="token punctuation">:</span> #08f<span class="token punctuation">;</span>
<span class="token punctuation">}</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p><img src="`+u+'" alt=""></p>',12),v={href:"https://visjs.github.io/vis-timeline/docs/graph2d/#Configuration_Options",target:"_blank",rel:"noopener noreferrer"},g=a(`<div class="language-typescript line-numbers-mode" data-ext="ts"><pre class="language-typescript"><code><span class="token keyword">const</span> timelinePlugin <span class="token operator">=</span> <span class="token keyword">new</span> <span class="token class-name">TimelinePlugin</span><span class="token punctuation">(</span>ogma<span class="token punctuation">,</span> container<span class="token punctuation">,</span> <span class="token punctuation">{</span>
  barchart<span class="token operator">:</span> <span class="token punctuation">{</span>
    graph2dOptions<span class="token operator">:</span> <span class="token punctuation">{</span>
      barChart<span class="token operator">:</span><span class="token punctuation">{</span> sideBySide<span class="token operator">:</span> <span class="token boolean">true</span><span class="token punctuation">}</span><span class="token punctuation">,</span>
      <span class="token comment">// here pass more options if you like</span>
    <span class="token punctuation">}</span><span class="token punctuation">,</span>
    <span class="token function-variable function">nodeGroupIdFunction</span><span class="token operator">:</span> <span class="token punctuation">(</span>node<span class="token punctuation">)</span> <span class="token operator">=&gt;</span> node<span class="token punctuation">.</span><span class="token function">getData</span><span class="token punctuation">(</span><span class="token string">&#39;type&#39;</span><span class="token punctuation">)</span>
  <span class="token punctuation">}</span>
<span class="token punctuation">}</span><span class="token punctuation">)</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h2 id="linechart-styling" tabindex="-1"><a class="header-anchor" href="#linechart-styling" aria-hidden="true">#</a> Linechart styling</h2><p>You can get the barchart to display lines by setting the <code>style</code> key to <code>line</code></p><div class="language-typescript line-numbers-mode" data-ext="ts"><pre class="language-typescript"><code><span class="token keyword">const</span> timelinePlugin <span class="token operator">=</span> <span class="token keyword">new</span> <span class="token class-name">TimelinePlugin</span><span class="token punctuation">(</span>ogma<span class="token punctuation">,</span> container<span class="token punctuation">,</span> <span class="token punctuation">{</span>
  barchart<span class="token operator">:</span> <span class="token punctuation">{</span>
    graph2dOptions<span class="token operator">:</span> <span class="token punctuation">{</span>
      style<span class="token operator">:</span> <span class="token string">&#39;line&#39;</span>
    <span class="token punctuation">}</span><span class="token punctuation">,</span>
  <span class="token punctuation">}</span>
<span class="token punctuation">}</span><span class="token punctuation">)</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>Then styling of the lines is as follows:</p><div class="language-css line-numbers-mode" data-ext="css"><pre class="language-css"><code><span class="token selector">.vis-group</span><span class="token punctuation">{</span>
  <span class="token property">fill-opacity</span><span class="token punctuation">:</span> 0<span class="token punctuation">;</span>
<span class="token punctuation">}</span>
<span class="token selector">.vis-group.person</span><span class="token punctuation">{</span>
  <span class="token property">stroke</span><span class="token punctuation">:</span> #ff9914<span class="token punctuation">;</span>
<span class="token punctuation">}</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p><img src="`+r+`" alt=""></p><h2 id="timeline-styling" tabindex="-1"><a class="header-anchor" href="#timeline-styling" aria-hidden="true">#</a> Timeline styling</h2><p>Timeline styling follows the same rules as the other charts, elements get classes depending on their group, and you can use it to stlye them. They also get as a class the <strong>nodeId</strong> of the node they represent. You can customize the names of the items with the <code>nodeItemGenerator</code> function.</p><div class="language-typescript line-numbers-mode" data-ext="ts"><pre class="language-typescript"><code><span class="token keyword">const</span> timelinePlugin <span class="token operator">=</span> <span class="token keyword">new</span> <span class="token class-name">TimelinePlugin</span><span class="token punctuation">(</span>ogma<span class="token punctuation">,</span> container<span class="token punctuation">,</span> <span class="token punctuation">{</span>
  timeline<span class="token operator">:</span> <span class="token punctuation">{</span>
    <span class="token function-variable function">nodeGroupIdFunction</span><span class="token operator">:</span> <span class="token punctuation">(</span>node<span class="token punctuation">)</span> <span class="token operator">=&gt;</span> node<span class="token punctuation">.</span><span class="token function">getData</span><span class="token punctuation">(</span><span class="token string">&#39;type&#39;</span><span class="token punctuation">)</span><span class="token punctuation">,</span>
    <span class="token function-variable function">nodeItemGenerator</span><span class="token operator">:</span> <span class="token punctuation">(</span>node<span class="token punctuation">)</span> <span class="token operator">=&gt;</span> <span class="token template-string"><span class="token template-punctuation string">\`</span><span class="token interpolation"><span class="token interpolation-punctuation punctuation">\${</span>node<span class="token punctuation">.</span><span class="token function">getData</span><span class="token punctuation">(</span>type<span class="token punctuation">)</span><span class="token interpolation-punctuation punctuation">}</span></span><span class="token string"> </span><span class="token interpolation"><span class="token interpolation-punctuation punctuation">\${</span>nodeId<span class="token interpolation-punctuation punctuation">}</span></span><span class="token template-punctuation string">\`</span></span><span class="token punctuation">,</span>
    timelineOptions<span class="token operator">:</span> <span class="token punctuation">{</span>
      <span class="token comment">//here pass more options if you like</span>
    <span class="token punctuation">}</span>
  <span class="token punctuation">}</span>
<span class="token punctuation">}</span><span class="token punctuation">)</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><div class="language-css line-numbers-mode" data-ext="css"><pre class="language-css"><code><span class="token selector">.timeline-item.car</span> <span class="token punctuation">{</span>
  <span class="token property">stroke</span><span class="token punctuation">:</span> #ff9914<span class="token punctuation">;</span>
  <span class="token property">fill</span><span class="token punctuation">:</span> #ff9914<span class="token punctuation">;</span>
<span class="token punctuation">}</span>
<span class="token selector">.timeline-item.car.vis-selected</span> <span class="token punctuation">{</span>
  <span class="token property">stroke</span><span class="token punctuation">:</span> #CCff55<span class="token punctuation">;</span>
  <span class="token property">fill</span><span class="token punctuation">:</span> #CCff55<span class="token punctuation">;</span>
<span class="token punctuation">}</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p><img src="`+d+'" alt=""></p>',12),h={href:"https://visjs.github.io/vis-timeline/docs/timeline/#Configuration_Options",target:"_blank",rel:"noopener noreferrer"},b=s("code",null,"timelineOptions",-1),y=a(`<h2 id="legend" tabindex="-1"><a class="header-anchor" href="#legend" aria-hidden="true">#</a> Legend</h2><p>To get the legend on barchart, you can simply pass the <code>legend</code> key</p><div class="language-typescript line-numbers-mode" data-ext="ts"><pre class="language-typescript"><code><span class="token keyword">const</span> timelinePlugin <span class="token operator">=</span> <span class="token keyword">new</span> <span class="token class-name">TimelinePlugin</span><span class="token punctuation">(</span>ogma<span class="token punctuation">,</span> container<span class="token punctuation">,</span> <span class="token punctuation">{</span>
  barchart<span class="token operator">:</span> <span class="token punctuation">{</span>
    graph2dOptions<span class="token operator">:</span> <span class="token punctuation">{</span>
      legend<span class="token operator">:</span> <span class="token punctuation">{</span>left<span class="token operator">:</span><span class="token punctuation">{</span>position<span class="token operator">:</span><span class="token string">&quot;bottom-left&quot;</span><span class="token punctuation">}</span><span class="token punctuation">}</span><span class="token punctuation">,</span>
    <span class="token punctuation">}</span><span class="token punctuation">,</span>
  <span class="token punctuation">}</span>
<span class="token punctuation">}</span><span class="token punctuation">)</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div>`,3);function f(_,x){const e=o("ExternalLinkIcon");return i(),c("div",null,[m,s("p",null,[n("To go further into barchart customization, you can pass "),s("a",v,[n("options"),t(e)]),n(" within the controller:")]),g,s("p",null,[n("To go further into customization, pass "),s("a",h,[n("options"),t(e)]),n(" in the "),b,n(" key.")]),y])}const T=p(k,[["render",f],["__file","styling.html.vue"]]);export{T as default};