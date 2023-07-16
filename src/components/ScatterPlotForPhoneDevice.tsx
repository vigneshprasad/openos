// import {ReactApexChart} from 'apexcharts'
import dynamic from 'next/dynamic'
import Select from './Select'
import { type dummyChurnGraph } from '~/constants/dummyData'
import { ScatterChurnGraph } from '~/server/api/routers/dataModelRouter'
import { useMemo } from 'react'
import { ApexOptions } from 'apexcharts'
const Chart = dynamic(() => import('react-apexcharts'), { ssr: false })

const ScatterPlotForPhoneDevice = ({
  churnGraphData
}: {
  churnGraphData: ScatterChurnGraph
}) => {

  const series = useMemo(() => [{
    name: 'Sample A',
    data: [...churnGraphData.map((item) => [item.x, item.y])]
  }], [churnGraphData])

  const options: ApexOptions = useMemo(() => ({
    chart: {
      height: 200,
      type: 'area',
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
      // type: 'numeric',
      // categories: [dummyChurnByDate.map((item) => item.date)]
      type: 'category',
      categories: [...churnGraphData.map((item) => item.x)],
      tickAmount: 10,
      labels: {
        formatter: function (val) {
          console.log({ val })
          return val
        }
      }
    },
    yaxis: {
      tickAmount: 7
    },
    tooltip: {
      x: {
        // format: 'dd/MM/yy HH:mm'
      },
    },
    colors: ['#4745A4', '#F9BA33']
  }), [churnGraphData]);

  return <div className="h-[250px] bg-white grow rounded-lg">
    <div className='flex justify-between items-center text-sm px-4 mt-2'>
      <div>Predicted Churn vs Actual Churn</div>
      <div className='flex items-center gap-2'>
        <div>Label 1</div>
        <div>Label 1</div>
        {/* <Select options={[]} title='Weekly'/> */}
      </div>
    </div>
    <Chart options={options} series={series} type="scatter" height={200} />
  </div>
}

export default ScatterPlotForPhoneDevice;
