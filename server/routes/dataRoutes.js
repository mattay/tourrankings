import express from "express";
import path from path


const router = express.Router()

/**
 * GET /api/data/datasets
 * List all avalibale datasets
 */
 router.get('/datasets' , async (req, res, next) => {
   try {
     const datasets = await getDatasets()
     res.json({ datasets });
   }catch (error){
     next(error)
   }
 })

 /**
  * GET /api/data/datasets/:name
  * Get info about a specific dataset
  */
  router.get('/datasets/:name', async(req, res, next)=>{
    try{
      const { name } = req.params;
    }catch(error){}
  })
