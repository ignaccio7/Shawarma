import { API_HOST } from "../config";
import { ApiSearchResponse, Data } from "../types.d";

export const searchData = async (search: string) 
  : Promise<[Error?, Data?]> => {

  try {
    const res = await fetch(`${API_HOST}/api/users?q=${search}`)

    if (!res.ok) {
      return [new Error(`Error searching data :${res.statusText}`)]
    }

    const json = await res.json() as ApiSearchResponse

    return[undefined, json.data]

  } catch (error) {
    if (error instanceof Error) {
      return [error]
    }
    return [new Error('Unknow error')]
  }

}