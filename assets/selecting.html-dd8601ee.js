import{_ as n,p as s,q as a,a1 as e}from"./framework-5866ffd3.js";const t="/ogma-timeline-plugin/selection.mp4",p={},o=e(`<h1 id="selecting" tabindex="-1"><a class="header-anchor" href="#selecting" aria-hidden="true">#</a> Selecting</h1><p>The plugin provides an easy way to synhronize selection between Ogma and the timeline:</p><ul><li>it triggers an even when user clicks on a timeline element</li><li>it provides a <code>setSelection</code> method to select elements wihin the timeline</li></ul><div class="language-javascript line-numbers-mode" data-ext="js"><pre class="language-javascript"><code><span class="token keyword">let</span> isSelecting <span class="token operator">=</span> <span class="token boolean">false</span><span class="token punctuation">;</span>
controller<span class="token punctuation">.</span><span class="token function">on</span><span class="token punctuation">(</span><span class="token string">&quot;select&quot;</span><span class="token punctuation">,</span> <span class="token punctuation">(</span><span class="token parameter"><span class="token punctuation">{</span> nodes<span class="token punctuation">,</span> edges <span class="token punctuation">}</span></span><span class="token punctuation">)</span> <span class="token operator">=&gt;</span> <span class="token punctuation">{</span>
  isSelecting <span class="token operator">=</span> <span class="token boolean">true</span><span class="token punctuation">;</span>
  ogma<span class="token punctuation">.</span><span class="token function">getNodes</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">.</span><span class="token function">setSelected</span><span class="token punctuation">(</span><span class="token boolean">false</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
  ogma<span class="token punctuation">.</span><span class="token function">getEdges</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">.</span><span class="token function">setSelected</span><span class="token punctuation">(</span><span class="token boolean">false</span><span class="token punctuation">)</span><span class="token punctuation">;</span>

  <span class="token keyword">if</span> <span class="token punctuation">(</span>nodes<span class="token punctuation">)</span> <span class="token punctuation">{</span>
    nodes<span class="token punctuation">.</span><span class="token function">setSelected</span><span class="token punctuation">(</span><span class="token boolean">true</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
  <span class="token punctuation">}</span>
  <span class="token keyword">if</span> <span class="token punctuation">(</span>edges<span class="token punctuation">)</span> <span class="token punctuation">{</span>
    edges<span class="token punctuation">.</span><span class="token function">setSelected</span><span class="token punctuation">(</span><span class="token boolean">true</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
  <span class="token punctuation">}</span>
  isSelecting <span class="token operator">=</span> <span class="token boolean">false</span><span class="token punctuation">;</span>
<span class="token punctuation">}</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
ogma<span class="token punctuation">.</span>events<span class="token punctuation">.</span><span class="token function">on</span><span class="token punctuation">(</span>
  <span class="token punctuation">[</span><span class="token string">&quot;nodesSelected&quot;</span><span class="token punctuation">,</span> <span class="token string">&quot;edgesSelected&quot;</span><span class="token punctuation">,</span> <span class="token string">&quot;nodesUnselected&quot;</span><span class="token punctuation">,</span> <span class="token string">&quot;edgesUnselected&quot;</span><span class="token punctuation">]</span><span class="token punctuation">,</span>
  <span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token operator">=&gt;</span> <span class="token punctuation">{</span>
    <span class="token keyword">if</span> <span class="token punctuation">(</span>isSelecting<span class="token punctuation">)</span> <span class="token keyword">return</span><span class="token punctuation">;</span>
    controller<span class="token punctuation">.</span><span class="token function">setSelection</span><span class="token punctuation">(</span><span class="token punctuation">{</span>
      <span class="token literal-property property">nodes</span><span class="token operator">:</span> ogma<span class="token punctuation">.</span><span class="token function">getSelectedNodes</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">,</span>
      <span class="token literal-property property">edges</span><span class="token operator">:</span> ogma<span class="token punctuation">.</span><span class="token function">getSelectedEdges</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">,</span>
    <span class="token punctuation">}</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
  <span class="token punctuation">}</span>
<span class="token punctuation">)</span><span class="token punctuation">;</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h2 id="styles-and-selection" tabindex="-1"><a class="header-anchor" href="#styles-and-selection" aria-hidden="true">#</a> Styles and selection</h2><p>When a timeline item is selected, the <code>vis-selected</code> class is added to it. So you can tweak selected styles using selectors:</p><div class="language-css line-numbers-mode" data-ext="css"><pre class="language-css"><code><span class="token selector">.timeline-item.car.vis-selected,
.vis-group.car.vis-selected</span>
 <span class="token punctuation">{</span>
  <span class="token property">stroke</span><span class="token punctuation">:</span> #CCff55<span class="token punctuation">;</span>
  <span class="token property">fill</span><span class="token punctuation">:</span> #CCff55<span class="token punctuation">;</span>
<span class="token punctuation">}</span>

</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h2 id="result" tabindex="-1"><a class="header-anchor" href="#result" aria-hidden="true">#</a> Result</h2><p><video src="`+t+'" class="video" controls> Your browser does not support playing HTML5 video. You can <a href="/selection.mp4" download>download the file</a> instead. Here is a description of the content: Result </video></p>',9),c=[o];function i(l,u){return s(),a("div",null,c)}const r=n(p,[["render",i],["__file","selecting.html.vue"]]);export{r as default};
