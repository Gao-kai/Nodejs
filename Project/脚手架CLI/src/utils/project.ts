import axios from 'axios';
import {getUserConfig} from '../constant.js'

const {organization,token,branch} = getUserConfig() as any;

export async function getOrgProjects(){
    try {
        const res = await axios.get(`https://gitee.com/api/v5/orgs/${organization}/repos`,{
            headers:{
                Authorization:"Bearer " + token
            }
        })
        return res.data;
        
    } catch (error) {
        console.log('------- error',error);
        return Promise.reject(error);
    }
}