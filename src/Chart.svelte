<script>
import Chart from 'chart.js/auto';
import {onMount} from 'svelte';
import { time_ranges_to_array } from 'svelte/internal';
let canvas;
let salesData =[];
/*
export const data = [ 
    { year: 2010, count: 10 },
    { year: 2011, count: 20 },
    { year: 2012, count: 15 },
    { year: 2013, count: 25 },
    { year: 2014, count: 22 },
    { year: 2015, count: 30 },
    { year: 2016, count: 28 },
  ];
  */

onMount (async function() {

  //name, category, goal,allocated time, start time, actual time, accomplished, productive (true/false)

  new Chart(
   canvas,
    {
      type: 'pie',
      data: {
        labels: data.map(row => row.year),
        datasets: [
          {
            label: '/build/bundle by year',
            data: data.map(row => row.count)
            goal: "cut nails",
            Alloc: 0,
            startTime: "2021-10-30T01:23:32.819Z",
            time: 564.87,
            accomplish: "what did you actually do?",
            productive: true
          }
        ]
      }
    }
  );
});
</script>Check out your time spent on each activity logged!
<canvas bind:this={canvas}>


</canvas>