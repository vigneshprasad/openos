import { type ApexOptions } from 'apexcharts';
import dynamic from 'next/dynamic';
import { type ScatterPlotData } from '~/server/api/routers/dataModelRouter';

const Chart = dynamic(() => import('react-apexcharts'), { ssr: false })

interface IProps {
    scatterPlotData: ScatterPlotData;
    title: string
}

export const ScatterPlot: React.FC<IProps> = ({
    scatterPlotData,
    title
}) => {


    const series = [];
    series.push({
        name: 'Probability',
        data: scatterPlotData.series
    });
    
    const options: ApexOptions = {
        title: {
            text: title,
            style: {
                fontWeight: 400
            }
        },
        dataLabels: {
            enabled: false,
            textAnchor: 'start'
        },
        legend: {
            show: false
        },
        stroke: {
            curve: 'smooth'
        },
        xaxis: {
            type: 'category',
            labels: {
                formatter: function (val) {
                    return val && typeof val == 'string' ? val.slice(0, 20) : ""
                }
            }
        },
        yaxis: {
            tickAmount: 5,
            labels: {
                formatter: function (val) {
                    return val.toFixed(2)
                }
            }
        },
        grid: {
            padding: {
                left: 25
            }
        },
        colors: ['#4745A4', '#F9BA33']
    };

    return (
        <div>
            <Chart options={options} series={series} type="scatter" height="300px" />
        </div>
    )  
}