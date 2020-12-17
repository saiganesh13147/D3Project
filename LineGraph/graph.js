      const margin = { top: 20, right: 20, bottom: 50, left: 100 };
      const graphwidth = 560 - margin.right - margin.left;
      const graphheight = 460 - margin.top - margin.bottom;

      const svg = d3.select('.canvas')
        .append('svg')
        .attr('width', graphwidth + margin.left + margin.right)
        .attr('height', graphheight + margin.top + margin.bottom);

      const graph = svg.append('g')
        .attr('width', graphwidth)
        .attr('height', graphheight)
        .attr('transform', `translate(${margin.left}, ${margin.top})`);

      // scales
      const x = d3.scaleTime().range([0, graphwidth]);
      const y = d3.scaleLinear().range([graphheight, 0]);

      // axes groups
      const xaxisGroup = graph.append('g')
        .attr('class', 'x-axis')
        .attr('transform', "translate(0," + graphheight + ")");

      const yaxisGroup = graph.append('g')
        .attr('class', 'y-axis');

      // d3 line path generator
      const line = d3.line()
        //.curve(d3.curveCardinal)
        .x(function(d){ return x(new Date(d.date))})
        .y(function(d){ return y(d.time)});

      // line path element
      const path = graph.append('path');

      // update function
      const update = (data) => {

        // filter data based on current activity
        data = data.filter(item => item.activity == activity);

        // sort the data based on date objects
        data.sort((a,b) => new Date(a.date) - new Date(b.date));

        // set scale domains
        x.domain(d3.extent(data, d => new Date(d.date)));
        y.domain([0, d3.max(data, d =>  d.time)]);

        // update path data
        path.data([data])
          .attr('fill', 'none')
          .attr('stroke', '#ffb74d')
          .attr('stroke-width', '2')
          .attr('d', line);

        // create circles for points
        const circles = graph.selectAll('circle')
          .data(data);

        // remove unwanted points
        circles.exit().remove();

        // update current points
        circles.attr('r', '3')
          .attr('cx', d => x(new Date(d.date)))
          .attr('cy', d => y(d.time));

        // add new points
        circles.enter()
          .append('circle')
            .attr('r', '4')
            .attr('cx', d => x(new Date(d.date)))
            .attr('cy', d => y(d.time))
            .attr('fill', '#ccc');

        // add event listeners to circle (and show dotted lines)
        graph.selectAll('circle')
          .on('mouseover', (d, i, n) => {
            d3.select(n[i])
              .transition().duration(120)
              .attr('r', 9)
              .attr('fill', '#fff');
          })

          .on('mouseleave', (d,i,n) => {
            d3.select(n[i])
              .transition().duration(120)
              .attr('r', 4)
              .attr('fill', '#fff');
          });

        // create axes
        const xAxis = d3.axisBottom(x)
          .ticks(4)
          .tickFormat(d3.timeFormat("%b %d"));
          
        const yAxis = d3.axisLeft(y)
          .ticks(4)
          .tickFormat(d => d + ' hr');

        // call axes
        xaxisGroup.call(xAxis);
        yaxisGroup.call(yAxis);

        // rotate axis text
        xaxisGroup.selectAll('text')
          .attr('transform', 'rotate(-40)')
          .attr('text-anchor', 'end');

      };

      // data and firestore
      var data = [];

      db.collection('tasks').onSnapshot(res => {

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