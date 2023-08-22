import type { ProductCorrelation } from "@prisma/client";


const ProductCorrelationsList = ({
    productCorrelations,
}: {
    productCorrelations: ProductCorrelation[],
}) => {

    return <div className="bg-white flex flex-col gap-4 rounded-lg">
        <div className="py-4">
            {productCorrelations.map((row, index) => {
                return (
                    <div key={row.id} className="grid grid-cols-[0.1fr_1.5fr_1.5fr_0.25fr] p-4 mr-8 ml-4 gap-12">
                        <div className="w-6 h-6 bg-light-grey-background-colour text-sm flex justify-center"> 
                            <div className="my-auto">{index + 1}</div>
                        </div>
                        <div className="border-y-0 border-l-0">{row.product1Name}</div>
                        <div className="border-y-0 border-l-0">{row.product2Name}</div>
                        <div> {row.correlationValue.toFixed(2)} </div>
                    </div>
                );
            })}
        </div>
    </div>
}

export default ProductCorrelationsList;