import {Hot} from '../models/hot';


export async function getAllHot() {
  return Hot.findMany({
    where: {
      id: 1
    }
  })
}
