import dynamic from 'next/dynamic'
import Select from './Select'
const Chart = dynamic(() => import('react-apexcharts'), { ssr: false })
import { type ApexOptions } from "apexcharts";
import { api } from '~/utils/api';
import { useEffect, useMemo, useState } from 'react';
import { type Churn } from '~/server/api/routers/dataModelRouter';

const PredictedChurnCard = ({value}: {value?: string}) => {
  return <div className="h-[120px] w-[200px] bg-predicted-churn-background 
          flex flex-col justify-center items-center rounded-2xl gap-4"
  >
      <div>
          Predicted Churn
      </div>
      <div>
          <b>{value}%</b>
      </div>
  </div>
}

const ActualChurnCard = ({value}: {value?: string}) => {
  return <div className="h-[120px] w-[200px] bg-actual-churn-background
          flex flex-col justify-center items-center rounded-2xl gap-4"
  >
      <div>
          Actual Churn
      </div>
      <div className="flex w-3/5 justify-between">
          <b>{value}%</b>
          <span>+9.15%</span>
      </div>
  </div>
}

const ChurnComparisonChart = ({
  modelId,
}: {
  modelId?: string
}) => {

  const [churnsByDay, setChurnsByDay] = useState<Churn[]>([]);

  const runChurnByDay = api.dataModelRouter.churnByDay.useMutation({
    onSuccess: (churnByDayData) => {
      console.log({ churnByDayData });
      setChurnsByDay(churnByDayData);
    }
  });

  useEffect(() => {
    if (!modelId) return;
    runChurnByDay.mutate({
      date: new Date(),
      modelId: '1',
    })
  }, [modelId]);


  const series = useMemo(() =>
    [{
      name: 'Predicted',
      data: [...churnsByDay.map((item) => item.predictedChurn * 100)],
    }, {
      name: 'Actual',
      data: [...churnsByDay.map((item) => (item.actualChurn || 0) * 100)]
    }]
    , [churnsByDay]);

  const options: ApexOptions = useMemo(() => (
    {
      chart: {
        height: 200,
      },
      dataLabels: {
        enabled: false
      },
      legend: {
        show: false
      },
      stroke: {
        curve: 'smooth'
      },
      xaxis: {
        type: 'datetime',
        categories: [...churnsByDay.map((item) => item.date)]
      },
      tooltip: {
        x: {
          format: 'dd/MM/yy'
        },
      },
      colors: ['#ECEBF9', '#C0ECDF']
    }
  ), [churnsByDay]);

  return <>
    <PredictedChurnCard value={churnsByDay[churnsByDay.length - 1]?.predictedChurn * 100}/>
    <ActualChurnCard value={churnsByDay[churnsByDay.length -1]?.actualChurn * 100}/>
  <div className="h-[250px] bg-white w-1/4 grow rounded-lg">
    <div className='flex justify-between items-center text-sm px-4 mt-2'>
      <div>Predicted Churn vs Actual Churn</div>
      <div className='flex items-center gap-2'>
        <div className='flex gap-2 items-center'>
          <div className='h-3 w-3 rounded-full bg-predicted-churn-background' />
          Predicted
        </div>
        <div className='flex gap-2 items-center'>
          <div className='h-3 w-3 rounded-full bg-actual-churn-background' />
          Actual
        </div>
        <Select options={[]} title='Weekly' />
      </div>
    </div>
    <Chart options={options} series={series} type="area" height={200} />
  </div>
  </>
}

export default ChurnComparisonChart;
