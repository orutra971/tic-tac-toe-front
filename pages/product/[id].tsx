import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/router'

const ProductItem = () => {
  const { query: { id } } = useRouter();
  const [product, setProduct] = useState<TProduct>();

  useEffect(() => {
    window
      .fetch(`/api/avo/${id}`)
      .then((response) => response.json())
      .then((data) =>{
        setProduct(data);
      });
  }, [])

  if (!product) return (<></>);

  return (
    <>
      <p>Id: {product.id}</p>
      <p>Image: {product.image}</p>
      <p>Name: {product.name}</p>
      <p>Price: {product.price}</p>
      <p>SKU: {product.sku}</p>
    </>
  )
}

export default ProductItem