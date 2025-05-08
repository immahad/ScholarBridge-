import React, { useState, useEffect } from "react";
import { LineChart } from "@mui/x-charts/LineChart";

export default function LineGraph() {
  const [chartDimensions, setChartDimensions] = useState({
    width: window.innerWidth * 0.8,
    height: window.innerHeight * 0.5,
  });

  useEffect(() => {
    function handleResize() {
      if (window.innerWidth < 400) {
        setChartDimensions({
          width: 300,
          height: window.innerHeight * 0.5,
        });
        console.log("object");
        return;
      }

      setChartDimensions({
        width: window.innerWidth * 0.8,
        height: window.innerHeight * 0.5,
      });
    }
    console.log(chartDimensions.width, chartDimensions.height);

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, [window.innerWidth]);

  return (
    <div className="bg-slate-200 rounded p-3 flex justify-center items-center">
      <LineChart
        xAxis={[{ data: [1, 2, 3, 5, 8, 10] }]}
        series={[
          {
            data: [2, 5.5, 2, 8.5, 1.5, 5],
            area: true,
          },
        ]}
        width={chartDimensions.width}
        height={chartDimensions.height}
      />
    </div>
  );
}
