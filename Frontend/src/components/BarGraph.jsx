import React, { useEffect, useState } from "react";
import { BarChart } from "@mui/x-charts/BarChart";

export default function BarGraph() {
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
    <div className="bg-slate-200 rounded p-3 flex justify-center items-center shadow-md">
      <BarChart
        xAxis={[{ scaleType: "band", data: ["group A", "group B", "group C"] }]}
        series={[{ data: [4, 3, 5] }, { data: [1, 6, 3] }, { data: [2, 5, 6] }]}
        width={chartDimensions.width}
        height={chartDimensions.height}
      />
    </div>
  );
}
