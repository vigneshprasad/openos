// import {ReactApexChart} from 'apexcharts'
import dynamic from 'next/dynamic'
import Select from './Select'
import { dummyChurnByDate, dummyChurnGraph } from '~/constants/dummyData'
const  Chart  = dynamic(() => import('react-apexcharts'), { ssr: false })

const options = {
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
      categories: [...dummyChurnGraph.map((item) => item.x)],
      tickAmount: 10,
                labels: {
                  formatter: function(val) {
                    console.log({val})
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
  }
  
const series = [{
    name: 'Sample A',
    data: [...dummyChurnGraph.map((item) => [item.x, item.y])]
}]


const ScatterPlotForPhoneDevice = () => {
    return <div className="h-[250px] bg-white grow rounded-lg">
        <div className='flex justify-between items-center text-sm px-4 mt-2'>
            <div>Predicted Churn vs Actual Churn</div>
            <div className='flex items-center gap-2'>
                <div>Label 1</div>
                <div>Label 1</div>
                {/* <Select options={[]} title='Weekly'/> */}
            </div>
            </div>
        <Chart options={options} series={series} type="scatter" height={200}/>
    </div>
}

export default ScatterPlotForPhoneDevice;
