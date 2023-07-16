import * as Dialog from '@radix-ui/react-dialog'
import dynamic from 'next/dynamic'
const Chart = dynamic(() => import('react-apexcharts'), { ssr: false })
import { api } from '~/utils/api';
import { useEffect, useMemo, useState } from 'react';
import { type dummyChurnGraph } from '~/constants/dummyData';
import Typography from '~/Typography';
import { type ApexOptions } from 'apexcharts';

interface IProps {
    isOpen: boolean;
    handleOpenChange: () => void;
    modelId?: string;
    featureId?: string;
    date?: Date;
    featureName: string;
}

export const ChurnScatterChartModal: React.FC<IProps> = ({
    isOpen,
    handleOpenChange,
    modelId,
    featureId,
    date,
    featureName
}) => {

  const [churnGraphData, setChurnGraphData] = useState<typeof dummyChurnGraph[]>([]);

  const runChurnGraphMutation = api.dataModelRouter.getChurnGraph.useMutation({
    onSuccess: (churnGraphData) => {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-expect-error
      setChurnGraphData(churnGraphData);
    }
  });

  useEffect(() => {
    if(!isOpen || !modelId || !featureId || !date)return;
      runChurnGraphMutation.mutate({
      modelId,
      featureId,
      date
    });
  }, [isOpen, modelId, featureId, date]);


  const series = useMemo(() => [{
    name: 'Sample A',
    data: [...churnGraphData.map((item) => [Number(item.x), Number(item.y)])]
  }], [churnGraphData])
  console.log({a: series[0]?.data})

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
      type: 'numeric',
      categories: [...churnGraphData.map((item) => Number(item.x)).sort()],
      tickAmount: 10,
      labels: {
        formatter: function (val) {
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

  return (
    <div>
      <Dialog.Root open={isOpen} onOpenChange={handleOpenChange}>
        <Dialog.Portal>
          <Dialog.Overlay className="DialogOverlay" />
          <Dialog.Content className="DialogContent bg-white w-[90vw] min-w-[800px] max-w-max min-h-[600px] p-5">
            <div
              className='flex flex-col w-full h-20 bg-white p-4 gap-2'
            >
              Probability vs {featureName}
            </div>
            <Chart options={options} series={series} type="scatter" />
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </div>
  )  
}