import dynamic from 'next/dynamic'
const Chart = dynamic(() => import('react-apexcharts'), { ssr: false })
import { type ApexOptions } from "apexcharts";
import { type GraphData } from '~/server/api/routers/dataModelRouter';
import moment from 'moment';

const AreaGraph = ({
    graphData,
    categoriesFormat,
}: {
    graphData: GraphData;
    categoriesFormat: string;
}) => {

    const { xAxis, title, data } = graphData;

    const options: ApexOptions = 
        {
            chart: {
                height: 200,
            },
            dataLabels: {
                enabled: false
            },
            legend: {
                show: true,
                offsetY: 10,
                itemMargin: {
                    vertical: 10,
                    horizontal: 20
                }
            },
            stroke: {
                curve: 'smooth',
                width: 1,
            },
            xaxis: {
                categories: [...xAxis.map((item) => moment(item).format(categoriesFormat))], 
                decimalsInFloat: 2,
            },
            yaxis: {
                labels: {
                    formatter: function (val) {
                        return val ? (val * 100).toFixed(0) + "%" : "";
                    },
                },
                decimalsInFloat: 2,
            },
            tooltip: {
                y: {
                    formatter: function (val) {
                        return val ? (val * 100).toFixed(2) + "%" : "";
                    }
                },
            },
            grid: {
                strokeDashArray: 4,
            },
        };

    return (
        <Chart options={options} series={
            [...data]
        } type="area" height={340} />
    )
}

export default AreaGraph;
