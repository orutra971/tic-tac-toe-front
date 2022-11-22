import Link from 'next/link';
import React, { useEffect, useState } from 'react';
import Input from '@components/Input/Input';
import Image from 'next/image'

const Home = () => {
  const [productList, setProductList] = useState<TProduct[]>([]);

  useEffect(() => {
    window
      .fetch('/api/avo')
      .then((response) => response.json())
      .then(({data, length}) =>{
        setProductList(data);
      });
  }, [])
  

  return (
    <>
      <h1>Hola Platzi!  dst</h1>
      <Input />
      <Image
        alt="ex"
        src="/example.png"
        fill
        sizes="(max-width: 768px) 100vw,
                (max-width: 1200px) 50vw,
                33vw"
      />
      <fieldset />
      <input />
      {productList.map((product: TProduct) => (
        <p  key={product.id}>
          <Link href={`product/${product.id}`}>{product.name}</Link>
        </p>
      ))}
    </>
  )
}

export default Home;