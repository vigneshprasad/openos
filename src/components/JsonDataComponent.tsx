import type { CommandResultType, JsonData } from "~/types/types";

interface Props {
    props: CommandResultType;
}

const JsonDataComponent: React.FC<Props> = ({ props }) => {
    const [dataRaw, error ] = props
    const data = dataRaw as JsonData;
    return (
        <>
            { data && 
                <div className="text-white">
                    <h3>
                        {
                            data.dateRange && 
                            `The date range was interpreted as 
                                ${data.dateRange.from.toLocaleDateString()} 
                                to ${data.dateRange.to.toLocaleDateString()}`
                        }
                    </h3>
                    <h3>
                        {
                            data.customer && 
                            `The customer was interpreted as
                                Name: ${String(data.customer.name)}
                                Email: ${String(data.customer.email)}
                                Phone: ${String(data.customer.phone)}
                            `
                        }
                    </h3>
                    <h3>
                        {
                            data.entityName && 
                            `The entity to provide was interpreted as ${String(data.entityName)}`
                        }
                    </h3>
                </div>
            }
            {error && 
                <div className="justify-content-end mt-8">
                    {error && <p className="text-red-500">Error: {error?.message} </p>}
                    <br />
                    {error && <p className="text-red-500">Details: {String(error?.cause)} </p>}
                    <br />
                    {error && <p className="text-red-500">Query: {String(error?.query)} </p>}
                </div>
            }
        </>
    );
};

export default JsonDataComponent;
