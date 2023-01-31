import {
  Chart as ChartJS,
  LinearScale,
  CategoryScale,
  BarElement,
  PointElement,
  LineElement,
  Legend,
  Tooltip,
  LineController,
  BarController,
  ChartType,
} from "chart.js";
import { Chart } from "react-chartjs-2";
import { ChartOptions } from "react-charts";

export default function ChartPrice(props: any) {
  let chartData = props.timeseries;
  // Chart stuff -------------- //
  ChartJS.register(
    LinearScale,
    CategoryScale,
    BarElement,
    PointElement,
    LineElement,
    Legend,
    Tooltip,
    LineController,
    BarController
  );
  const labels: any = [];
  const priceData: any = [];
  const volumeData: any = [];

  for (const key in chartData) {
    labels.push(chartData[key].datetime);
    priceData.push(parseFloat(chartData[key].txn_price));
    volumeData.push(parseFloat(chartData[key].volume_eth));
  }

  const data = {
    labels,
    datasets: [
      {
        type: "line" as const,
        label: "P",
        borderColor: "#4A0BFF",
        borderWidth: 2,
        fill: false,
        data: priceData,
        yAxisID: "P",
      },
      {
        type: "bar" as const,
        label: "V",
        backgroundColor: "#292929",
        maxBarThickness: 4,
        borderSkipped: false,
        data: volumeData,
        yAxisID: "V",
      },
    ],
  };

  const options = {
    aspectRatio: 2,
    animation: false,
    plugins: {
      legend: { display: false },
    },
    scales: {
      P: {
        grid: { display: false },
        type: "linear",
        position: "left",
        display: false,
        // min:-0.06,
        // max:0.12
      },
      V: {
        grid: { display: false },
        type: "linear",
        position: "right",
        display: false,
        // min:0,
        // max:100
      },
      x: { display: false },
    },
    elements: {
      point: {
        pointStyle: "circle",
        radius: 0,
      },
      line: {
        tension: 0.1,
        spanGaps: true,
      },
      bar: {
        borderRadius: 4,
      },
    },
  };

  return (
    <Chart
      type="bar"
      data={data}
      // @ts-ignore
      options={options}
    />
  );
}
