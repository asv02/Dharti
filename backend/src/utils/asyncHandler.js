//sync handler using promises

const asyncHandler=(requestHandler) => 
    {
       return (req,res,next) =>
            {
                Promise.resolve(requestHandler(req,res,next))
                .catch((error) => next(error)) 
            }
    }

export default asyncHandler
// async handler using try-catch
// const asyncHandler= (func) => async(req,res,next)=>
//     {
//        try {
//          await func(res,req,next)
//        } catch (error) {
//         res.status(error.code || 500).json({
//             success:false,
//             message:error.message
//         })
//        }
//     }