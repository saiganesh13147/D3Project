const screen = { height: 350, width: 1000 };

const svg = d3.select('.canvas')
  .append('svg')
  .attr('width', screen.width + 100)
  .attr('height', screen.height + 100);

const graph = svg.append('g')
                 .attr('transform', 'translate(50, 50)');


const stratify = d3.stratify()
  .id(d => d.name)
  .parentId(d => d.parent);

const tree = d3.tree()
  .size([screen.width, screen.height]);


const colour = d3.scaleOrdinal(['#fce005', '#05fcd3' ,'#e91e63', '#e53935', '#33FF35']);


const update = (data) => {


  graph.selectAll('.node').remove();
  graph.selectAll('.link').remove();

  // update ordinal scale domain
  colour.domain(data.map(d => d.group));

  const rootNode = stratify(data);
  const treeData = tree(rootNode).descendants();
  

  const nodes = graph.selectAll('.node')
    .data(treeData);


  const link = graph.selectAll('.link')
    .data(tree(rootNode).links());


  link.enter()
    .append('path')
      .transition().duration(300)
      .attr('class', 'link')
      .attr('fill', 'none')
      .attr('stroke', '#aaaccc') 
      .attr('stroke-width', 4)
      .attr('d', d3.linkVertical()
        .x(d => d.x)
        .y(d => d.y )
      );


  const enterNodes = nodes.enter()
    .append('g')
      .attr('class', 'node')
      .attr('transform', d => `translate(${d.x}, ${d.y})`);
      
  
  enterNodes.append('rect')

    .attr('fill', d => colour(d.data.group))
    .attr('stroke', '#555')
    .attr('stroke-width', 3)
    .attr('width', d => d.data.name.length * 20)
    .attr('height', 50)
    .attr('transform', (d,i,n) => {
      let x = (d.data.name.length * 10);
      return `translate(${-x}, -25)`
    });

  enterNodes.append('text')
    .attr('text-anchor', 'middle')
    .attr('dy', 5)
    .attr('fill', 'white')
    .text(d => d.data.name); 

    var treeZoom = d3.zoom();
            
    treeZoom.on("zoom",zoomed);
    
    d3.select("svg").call(treeZoom);
     
    function zoomed(){
        
        d3.select("svg")
            .attr("transform",`translate(${d3.event.transform.x},${d3.event.transform.y})`);
    }

};

// data & firebase hook-up
var data = [];

db.collection('technology').onSnapshot(res=> {

  res.docChanges().forEach(change => {

    const doc = {...change.doc.data(), id: change.doc.id};

    switch (change.type) {
      case 'added':
        data.push(doc);
        break;
      case 'modified':
        const index = data.findIndex(item => item.id == doc.id);
        data[index] = doc;
        break;
      case 'removed':
        data = data.filter(item => item.id !== doc.id);
        break;
      default:
        break;
    }

  });

  update(data);

});