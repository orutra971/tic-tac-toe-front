import axios from "axios";
const instance = axios.create({
  baseURL: `${process.env.NEXT_PUBLIC_BACKEND_BASE}`,
  timeout: 1000,
});


export const post = async (endpoit: string, data: unknown, token: string) => {
  return instance.post(endpoit, data, {headers: {"x-access-token": token}})
}

export const get = async (endpoit: string, token: string) => {
  return instance.get(endpoit, {headers: {"x-access-token": token}})
}

export const patch = async (endpoit: string, data: unknown, token: string) => {
  return instance.patch(endpoit, data, {headers: {"x-access-token": token}})
}

export const del = async (endpoit: string, token: string) => {
  return instance.delete(endpoit, {headers: {"x-access-token": token}})
}