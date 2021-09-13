import React from 'react';
import { Bar } from 'react-chartjs-2';
import { useTheme } from '@material-ui/core/styles';
import { DataChart } from './chart.vm';

interface Props {
  title?: string;
  dataChart: DataChart[];
}

const options = {
  scales: {
    yAxes: [
      {
        ticks: {
          beginAtZero: true,
        },
      },
    ],
  },
};

const ChartComponent: React.FunctionComponent<Props> = ({
  dataChart,
  title,
}) => {
  const theme = useTheme();

  const getData = () => ({
    labels: dataChart.map((data) => data.label),
    datasets: [
      {
        type: 'line',
        label: 'Evolution',
        borderColor: theme.palette.primary.main,
        borderWidth: 2,
        fill: true,
        data: dataChart.map((data) => data.amount),
      },
      {
        type: 'bar',
        label: 'Total Year',
        backgroundColor: theme.palette.secondary.main,
        data: dataChart.map((data) => data.amount),
        borderColor: 'white',
        borderWidth: 2,
      },
    ],
  });

  return (
    <>
      <div className="header">
        <h1 className="title">{title}</h1>
      </div>
      <Bar data={getData()} options={options} />
    </>
  );
};

export default ChartComponent;
