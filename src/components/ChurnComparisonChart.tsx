// import {ReactApexChart} from 'apexcharts'
import dynamic from 'next/dynamic'
import Select from './Select'
import { dummyChurnByDate } from '~/constants/dummyData'
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
      type: 'datetime',
      // categories: []
      categories: [...dummyChurnByDate.map((item) => item.date)]
    },
    tooltip: {
      x: {
        format: 'dd/MM/yy'
      },
    },
    colors: ['#4745A4', '#F9BA33']
  }

const series = [{
    name: 'Predicted',
    data: [...dummyChurnByDate.map((item) => item.predictedChurn * 100)],
  }, {
    name: 'Actual',
    data: [...dummyChurnByDate.map((item) => item.actualChurn*100)]
  }]


const ChurnComparisonChart = () => {
    return <div className="h-[250px] bg-white w-1/4 grow rounded-lg">
        <div className='flex justify-between items-center text-sm px-4 mt-2'>
            <div>Predicted Churn vs Actual Churn</div>
            <div className='flex items-center gap-2'>
                <div>Label 1</div>
                <div>Label 1</div>
                <Select options={[]} title='Weekly'/>
            </div>
            </div>
        <Chart options={options} series={series} type="area" height={200}/>
    </div>
}

export default ChurnComparisonChart;
