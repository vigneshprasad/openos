export const IntegrationStatus: React.FC = () => {

//     const [databaseResource, setDatabaseResource] = useState<Number>(0);
//     const [databaseResource, razorpayResource, stripeResource, bankStatementResource, mixpanelresource ] = useState<Churn[]>([]);

//   const runChurnByDay = api.dataModelRouter.churnByDay.useMutation({
//     onSuccess: (churnByDayData) => {
//       console.log({ churnByDayData });
//       setChurnsByDay(churnByDayData);
//     }
//   });

//   useEffect(() => {
//     if (!modelId) return;
//     runChurnByDay.mutate({
//       date: new Date(),
//       modelId: '1',
//     })
//   }, [modelId]);
    

    return (
        <div className="h-12 flex-row flex flex-basis-content p-1 bg-homepage-tab-background">
            <div className="flex gap-2 items-center ml-3">
                <h3>Predicted churn for cohorts</h3>
                <div className="bg-success-badge px-3 py-1 rounded-full">Database</div>
            </div>
        </div>
    );
}
