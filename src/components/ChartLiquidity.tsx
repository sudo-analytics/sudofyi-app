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
} from "chart.js";
import { Chart } from "react-chartjs-2";

export default function ChartLiquidity(props: any) {
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
  const listingData: any = [];
  const offerData: any = [];

  for (const key in chartData) {
    labels.push(chartData[key].datetime);
    listingData.push(parseFloat(chartData[key].listings_number));
    offerData.push(parseFloat(chartData[key].offers_eth));
  }

  const data = {
    labels,
    datasets: [
      {
        type: "line" as const,
        label: "L",
        borderColor: "#4A0BFF",
        borderWidth: 2,
        fill: false,
        data: listingData,
        yAxisID: "L",
      },
      {
        type: "line" as const,
        label: "O",
        borderColor: "#9A4AFF",
        borderWidth: 2,
        fill: false,
        data: offerData,
        yAxisID: "O",
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
      L: {
        grid: { display: false },
        type: "linear",
        position: "left",
        display: false,
        // min:-0.06,
        // max:0.12
      },
      O: {
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
