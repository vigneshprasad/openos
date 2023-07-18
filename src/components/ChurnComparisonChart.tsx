import dynamic from 'next/dynamic'
const Chart = dynamic(() => import('react-apexcharts'), { ssr: false })
import { type ApexOptions } from "apexcharts";
import { api } from '~/utils/api';
import { useEffect, useMemo, useState } from 'react';
import { type Churn } from '~/server/api/routers/dataModelRouter';

const PredictedChurnCard = ({ value }: { value?: string | number }) => {
    return ( 
        <div className="h-[120px] w-[200px] bg-predicted-churn-background flex flex-col justify-center items-center rounded-2xl gap-4">
            <div>
                Predicted Churn
            </div>
            <div>
                <b>{value}%</b>
            </div>
        </div>
    )
}

const ActualChurnCard = ({ value }: { value?: string | number }) => {
  return (
        <div className="h-[120px] w-[200px] bg-actual-churn-background flex flex-col justify-center items-center rounded-2xl gap-4">
            <div>
                Actual Churn
            </div>
            <div>
                <b>{value == undefined ? '-' : value}%</b>
            </div>
        </div>   
    )
}

const TotalUsersCard = ({ value }: { value?: string | number }) => {
    return (
        <div className="h-[120px] w-[200px] bg-total-users-background flex flex-col justify-center items-center rounded-2xl gap-4">
            <div>
                Total Users
            </div>
            <div>
                <b>{value}</b>
            </div>
        </div>
    )
}

const ChurnComparisonChart = ({
    modelId,
    date
}: {
    modelId?: string,
    date?: Date
}) => {

    const [churnsByDay, setChurnsByDay] = useState<Churn[]>([]);

    const runChurnByDay = api.dataModelRouter.churnByDay.useMutation({
        onSuccess: (churnByDayData) => {
            setChurnsByDay(churnByDayData);
        }
    });

    useEffect(() => {
        if (!modelId || !date) return;
        runChurnByDay.mutate({
            date,
            modelId,
        })
    }, [modelId, date]);


    const series = useMemo(() =>
        [{
            name: 'Predicted',
            data: [...churnsByDay.map((item) => item.predictedChurn * 100)],
        }, {
            name: 'Actual',
            data: [...churnsByDay.map((item) => item.actualChurn == undefined ? null : (item.actualChurn || 0) * 100)]
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
                categories: [...churnsByDay.map((item) => item.date)],
                labels: {
                    style: {
                        colors: '#999999'
                    }
                }
            },
            yaxis: {
                labels: {
                    style: {
                        colors: '#999999'
                    }
                }
            },
            tooltip: {
                x: {
                    format: 'dd/MM/yy'
                },
            },
            grid: {
                strokeDashArray: 12,
                borderColor: '#EBEBEB'
            },
            colors: ['#ECEBF9', '#C0ECDF']
        }
    ), [churnsByDay]);

    return (
        <>
            <div className="flex flex-col gap-5">
                <TotalUsersCard value={(churnsByDay[churnsByDay.length - 1]?.users || 0)} />
                <PredictedChurnCard value={(churnsByDay[churnsByDay.length - 1]?.predictedChurn  || 0) * 100} />
                <ActualChurnCard value={churnsByDay[churnsByDay.length - 1]?.actualChurn == undefined ? undefined : ((churnsByDay[churnsByDay.length - 1]?.actualChurn || 0) * 100)} />
            </div>
            <div className="h-[400px] bg-white w-1/4 grow rounded-lg px-2">
                <div className='flex justify-between items-center text-sm px-4 mt-2'>
                    <div className='flex items-center gap-5'>
                        <div className='flex gap-2 items-center'>
                            <div className='h-3 w-3 rounded-full bg-predicted-churn-background' />
                            Predicted
                        </div>
                        <div className='flex gap-2 items-center'>
                            <div className='h-3 w-3 rounded-full bg-actual-churn-background' />
                            Actual
                        </div>
                    </div>
                </div>
                <div className='w-[95%]'>
                    <Chart options={options} series={series} type="area" height={340} />
                </div>
            </div>
        </>
    )
}

export default ChurnComparisonChart;
