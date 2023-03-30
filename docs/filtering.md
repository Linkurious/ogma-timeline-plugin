# Filtering

Please refer to [Getting started](/#filter-nodes-depending-on-time) section to learn how to link timeline filtering with Ogma `addNodeFilter`. 

When user drags timebars, the plugin updates the list of filtered `NodeId` depending on the passed filtering options.
```ts
type FilterOptions = {
  enabled: boolean;  
  strategy: 'before' | 'after' | 'between' | 'outside';
  tolerance: 'strict' | 'loose';
}
```
See below how the different strategy/combination work.
In case of `between`/`outside`, you can pass pairs of timebars, then each pair will be studied separatly. 
In case of `before`/`after`, only the fist/last timebar is considered. 

## Between loose
![between loose](/between-loose.png)
## Between strict
![between strict](/between-strict.png)
## Outside loose
![outside loose](/outside-loose.png)
## Outside strict
![outside strict](/outside-strict.png)
## Before loose
![before loose](/before-loose.png)
## Before strict
![before strict](/before-strict.png)
## After loose
![after loose](/after-loose.png)
## After strict
![after strict](/after-strict.png)



