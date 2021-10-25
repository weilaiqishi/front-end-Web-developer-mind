function Graph() {
    this.vertices = []; //存储图中所有的顶点名字
    this.adjList = new Dictionary();//用之前的一个字典来存储邻接表
    this.addVertex = function(v){ //添加顶点
        this.vertices.push(v);
        this.adjList.set(v, []); //顶点为键，字典值为空数组
    };
    this.addEdge = function(v, w){ //添加边
        this.adjList.get(v).push(w); //基于有向图
        this.adjList.get(w).push(v); //基于无向图
    };
    this.toString = function(){
        var s = '';
        for (var i=0; i<this.vertices.length; i++){
            s += this.vertices[i] + ' -> ';
            var neighbors = this.adjList.get(this.vertices[i]);
            for (var j=0; j<neighbors.length; j++){
                s += neighbors[j] + ' ';
            }
            s += '\n';
        }
        return s;
    };
    this.initializeColor = function(){
        var color = [];
        for (var i=0; i<this.vertices.length; i++){
            color[this.vertices[i]] = 'white';
        }
        return color;
    };

    this.dfs = function(callback){
        var color = this.initializeColor(); // 初始化颜色数组
        for (var i=0; i<this.vertices.length; i++){
            if (color[this.vertices[i]] === 'white'){
                this.dfsVisit(this.vertices[i], color, callback); //递归调用未被访问过的顶点
            }
        }
    };
    this.dfsVisit = function(u, color, callback){
        color[u] = 'grey';
        if (callback) {
            callback(u);
        }
        var neighbors = this.adjList.get(u); //邻接表
        for (var i=0; i<neighbors.length; i++){
            var w = neighbors[i];
            if (color[w] === 'white'){
                this.dfsVisit(w, color, callback); //添加顶点w入栈
            }
        }
        color[u] = 'black';
    };

    this.bfs = function(v, callback){
        var color = this.initializeColor(),
            queue = []; //创建一个队列
        queue.push(v); //入队列
        while (queue.length){ // 队列不为空
            var u = queue.pop(), //出队列
                neighbors = this.adjList.get(u); //邻接表
            color[u] = 'grey'; //发现了但还未完成对其的搜素
            for (var i=0; i<neighbors.length; i++){
                var w = neighbors[i]; //顶点名
                if (color[w] === 'white'){
                    color[w] = 'grey'; //发现了它
                    queue.push(w);
                }
            }
            color[u] = 'black'; //已搜索过
            if (callback) {
                callback(u);
            }
        }
    };
}  
//测试
var graph = new Graph();
var myVertices = ['A','B','C','D','E','F','G','H','I'];
for (var i=0; i<myVertices.length; i++){
    graph.addVertex(myVertices[i]);
}
graph.addEdge('A', 'B');
graph.addEdge('A', 'C');
graph.addEdge('A', 'D');
graph.addEdge('C', 'D');
graph.addEdge('C', 'G');
graph.addEdge('D', 'G');
graph.addEdge('D', 'H');
graph.addEdge('B', 'E');
graph.addEdge('B', 'F');
graph.addEdge('E', 'I');
// console.log(graph.toString());

function printNode(value){
    console.log('Visited vertex: ' + value);
 }
 graph.dfs(printNode);
 graph.bfs(myVertices[0], printNode);

function Dictionary(){
    this.items = {};
    this.set = function(key, value){
        this.items[key] = value; 
    };
    this.remove = function(key){
        if (this.has(key)){
            delete this.items[key];
            return true;
        }
        return false;
    };
    this.has = function(key){
        return this.items.hasOwnProperty(key);
    };
    this.get = function(key) {
        return this.has(key) ? this.items[key] : undefined;
    };
    this.clear = function(){
        this.items = {};
    };
    this.size = function(){
        return Object.keys(this.items).length;
    };
    this.keys = function(){
        return Object.keys(this.items);
    };
    this.values = function(){
        var values = [];
        for (var k in this.items) {
            if (this.has(k)) {
                values.push(this.items[k]);
            }
        }
        return values;
    };
    this.each = function(fn) {
        for (var k in this.items) {
            if (this.has(k)) {
                fn(k, this.items[k]);
            }
        }
    };
    this.getItems = function(){
        return this.items;
    }
}