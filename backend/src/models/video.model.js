import mongoose from 'mongoose'
import mongooseAggregatePaginate from 'mongoose-aggregate-paginate-v2'
const VideoSchema = new mongoose.Schema(
    {
        videofile: { type: String, required: true },//3rd party url
        thumbnail: { type: String, required: true },
        owner:
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User"
        },
        title: { type: String, required: true },
        description: { type: String, required: true },
        duration: { type: Number },
        views: { type: Number, default: 0 },
        isPublished: { type: Boolean, default: true },
    }, { timestamps: true })

VideoSchema.plugin(mongooseAggregatePaginate)//use to write aggregation query
export const Video = mongoose.model("Video", VideoSchema)
