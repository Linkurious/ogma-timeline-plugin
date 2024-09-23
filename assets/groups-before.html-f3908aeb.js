import{_ as n,o as s,c as a,e as t}from"./app-8a3299c4.js";const p={},o=t(`<div class="language-typescript line-numbers-mode" data-ext="ts"><pre class="language-typescript"><code><span class="token keyword">const</span> ogma <span class="token operator">=</span> <span class="token keyword">new</span> <span class="token class-name">Ogma</span><span class="token punctuation">(</span><span class="token punctuation">{</span>
  container<span class="token operator">:</span> <span class="token string">&quot;ogma&quot;</span><span class="token punctuation">,</span>
  graph<span class="token operator">:</span> <span class="token punctuation">{</span>
    nodes<span class="token operator">:</span> <span class="token punctuation">[</span>
      <span class="token punctuation">{</span>
        id<span class="token operator">:</span> <span class="token number">1</span><span class="token punctuation">,</span>
        data<span class="token operator">:</span> <span class="token punctuation">{</span> type<span class="token operator">:</span> <span class="token string">&quot;car&quot;</span><span class="token punctuation">,</span> start<span class="token operator">:</span> <span class="token keyword">new</span> <span class="token class-name">Date</span><span class="token punctuation">(</span><span class="token string">&quot;1 1 1971&quot;</span><span class="token punctuation">)</span> <span class="token punctuation">}</span><span class="token punctuation">,</span>
      <span class="token punctuation">}</span><span class="token punctuation">,</span>
      <span class="token punctuation">{</span>
        id<span class="token operator">:</span> <span class="token number">2</span><span class="token punctuation">,</span>
        data<span class="token operator">:</span> <span class="token punctuation">{</span> type<span class="token operator">:</span> <span class="token string">&quot;car&quot;</span><span class="token punctuation">,</span> start<span class="token operator">:</span> <span class="token keyword">new</span> <span class="token class-name">Date</span><span class="token punctuation">(</span><span class="token string">&quot;1 1 1991&quot;</span><span class="token punctuation">)</span> <span class="token punctuation">}</span><span class="token punctuation">,</span>
      <span class="token punctuation">}</span><span class="token punctuation">,</span>
      <span class="token punctuation">{</span>
        id<span class="token operator">:</span> <span class="token number">3</span><span class="token punctuation">,</span>
        data<span class="token operator">:</span> <span class="token punctuation">{</span> type<span class="token operator">:</span> <span class="token string">&quot;car&quot;</span><span class="token punctuation">,</span> start<span class="token operator">:</span> <span class="token keyword">new</span> <span class="token class-name">Date</span><span class="token punctuation">(</span><span class="token string">&quot;1 1 1992&quot;</span><span class="token punctuation">)</span> <span class="token punctuation">}</span><span class="token punctuation">,</span>
      <span class="token punctuation">}</span><span class="token punctuation">,</span>
      <span class="token punctuation">{</span>
        id<span class="token operator">:</span> <span class="token number">4</span><span class="token punctuation">,</span>
        data<span class="token operator">:</span> <span class="token punctuation">{</span>
          type<span class="token operator">:</span> <span class="token string">&quot;person&quot;</span><span class="token punctuation">,</span>
          start<span class="token operator">:</span> <span class="token keyword">new</span> <span class="token class-name">Date</span><span class="token punctuation">(</span><span class="token string">&quot;1 1 1970&quot;</span><span class="token punctuation">)</span><span class="token punctuation">,</span>
        <span class="token punctuation">}</span><span class="token punctuation">,</span>
      <span class="token punctuation">}</span><span class="token punctuation">,</span>
      <span class="token punctuation">{</span>
        id<span class="token operator">:</span> <span class="token number">5</span><span class="token punctuation">,</span>
        data<span class="token operator">:</span> <span class="token punctuation">{</span>
          type<span class="token operator">:</span> <span class="token string">&quot;person&quot;</span><span class="token punctuation">,</span>
          start<span class="token operator">:</span> <span class="token keyword">new</span> <span class="token class-name">Date</span><span class="token punctuation">(</span><span class="token string">&quot;1 1 1990&quot;</span><span class="token punctuation">)</span><span class="token punctuation">,</span>
        <span class="token punctuation">}</span><span class="token punctuation">,</span>
      <span class="token punctuation">}</span><span class="token punctuation">,</span>
    <span class="token punctuation">]</span><span class="token punctuation">,</span>
    edges<span class="token operator">:</span> <span class="token punctuation">[</span><span class="token punctuation">]</span><span class="token punctuation">,</span>
  <span class="token punctuation">}</span><span class="token punctuation">,</span>
<span class="token punctuation">}</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
ogma<span class="token punctuation">.</span>styles<span class="token punctuation">.</span><span class="token function">addNodeRule</span><span class="token punctuation">(</span><span class="token punctuation">(</span>node<span class="token punctuation">)</span> <span class="token operator">=&gt;</span> node<span class="token punctuation">.</span><span class="token function">getData</span><span class="token punctuation">(</span><span class="token string">&quot;type&quot;</span><span class="token punctuation">)</span> <span class="token operator">===</span> <span class="token string">&quot;car&quot;</span><span class="token punctuation">,</span> <span class="token punctuation">{</span>
  color<span class="token operator">:</span> <span class="token string">&quot;#f80&quot;</span><span class="token punctuation">,</span>
  text<span class="token operator">:</span> <span class="token punctuation">{</span>
    <span class="token function-variable function">content</span><span class="token operator">:</span> <span class="token punctuation">(</span>node<span class="token punctuation">)</span> <span class="token operator">=&gt;</span> <span class="token template-string"><span class="token template-punctuation string">\`</span><span class="token string">car </span><span class="token interpolation"><span class="token interpolation-punctuation punctuation">\${</span>node<span class="token operator">?.</span><span class="token function">getId</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token interpolation-punctuation punctuation">}</span></span><span class="token template-punctuation string">\`</span></span><span class="token punctuation">,</span>
    size<span class="token operator">:</span> <span class="token number">20</span><span class="token punctuation">,</span>
  <span class="token punctuation">}</span><span class="token punctuation">,</span>
<span class="token punctuation">}</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
ogma<span class="token punctuation">.</span>styles<span class="token punctuation">.</span><span class="token function">addNodeRule</span><span class="token punctuation">(</span><span class="token punctuation">(</span>node<span class="token punctuation">)</span> <span class="token operator">=&gt;</span> node<span class="token punctuation">.</span><span class="token function">getData</span><span class="token punctuation">(</span><span class="token string">&quot;type&quot;</span><span class="token punctuation">)</span> <span class="token operator">===</span> <span class="token string">&quot;person&quot;</span><span class="token punctuation">,</span> <span class="token punctuation">{</span>
  color<span class="token operator">:</span> <span class="token string">&quot;#08f&quot;</span><span class="token punctuation">,</span>
  text<span class="token operator">:</span> <span class="token punctuation">{</span>
    <span class="token function-variable function">content</span><span class="token operator">:</span> <span class="token punctuation">(</span>node<span class="token punctuation">)</span> <span class="token operator">=&gt;</span> <span class="token template-string"><span class="token template-punctuation string">\`</span><span class="token string">person </span><span class="token interpolation"><span class="token interpolation-punctuation punctuation">\${</span>node<span class="token operator">?.</span><span class="token function">getId</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token interpolation-punctuation punctuation">}</span></span><span class="token template-punctuation string">\`</span></span><span class="token punctuation">,</span>
    size<span class="token operator">:</span> <span class="token number">20</span><span class="token punctuation">,</span>
  <span class="token punctuation">}</span><span class="token punctuation">,</span>
<span class="token punctuation">}</span><span class="token punctuation">)</span><span class="token punctuation">;</span>

ogma<span class="token punctuation">.</span>layouts<span class="token punctuation">.</span><span class="token function">force</span><span class="token punctuation">(</span><span class="token punctuation">{</span>
  locate<span class="token operator">:</span> <span class="token punctuation">{</span> padding<span class="token operator">:</span> <span class="token number">200</span> <span class="token punctuation">}</span><span class="token punctuation">,</span>
<span class="token punctuation">}</span><span class="token punctuation">)</span><span class="token punctuation">;</span>

<span class="token keyword">const</span> controller <span class="token operator">=</span> <span class="token keyword">new</span> <span class="token class-name">Controller</span><span class="token punctuation">(</span>ogma<span class="token punctuation">,</span> document<span class="token punctuation">.</span><span class="token function">getElementById</span><span class="token punctuation">(</span><span class="token string">&quot;timeline&quot;</span><span class="token punctuation">)</span><span class="token punctuation">,</span> <span class="token punctuation">{</span>
  filter<span class="token operator">:</span> <span class="token punctuation">{</span>
    enabled<span class="token operator">:</span> <span class="token boolean">true</span><span class="token punctuation">,</span>
    strategy<span class="token operator">:</span> <span class="token string">&quot;outisde&quot;</span><span class="token punctuation">,</span>
    tolerance<span class="token operator">:</span> <span class="token string">&quot;strict&quot;</span><span class="token punctuation">,</span>
  <span class="token punctuation">}</span><span class="token punctuation">,</span>
  start<span class="token operator">:</span> <span class="token keyword">new</span> <span class="token class-name">Date</span><span class="token punctuation">(</span><span class="token string">&quot;1 1 1930&quot;</span><span class="token punctuation">)</span><span class="token punctuation">,</span>
  end<span class="token operator">:</span> <span class="token keyword">new</span> <span class="token class-name">Date</span><span class="token punctuation">(</span><span class="token string">&quot;1 1 2050&quot;</span><span class="token punctuation">)</span><span class="token punctuation">,</span>
<span class="token punctuation">}</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div>`,1),e=[o];function c(u,l){return s(),a("div",null,e)}const k=n(p,[["render",c],["__file","groups-before.html.vue"]]);export{k as default};