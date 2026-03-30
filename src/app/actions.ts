'use server';
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

// PRODUTOS
export async function getProductsAction() {
  return await prisma.product.findMany({
    orderBy: { createdAt: 'desc' }
  });
}

export async function addProductAction(data: any) {
  const { id, ...rest } = data;
  const product = await prisma.product.create({
    data: { ...rest }
  });
  revalidatePath('/');
  return product;
}

export async function updateProductAction(id: string, data: any) {
  const product = await prisma.product.update({
    where: { id },
    data: { ...data }
  });
  revalidatePath('/');
  return product;
}

export async function deleteProductAction(id: string) {
  await prisma.product.delete({ where: { id } });
  revalidatePath('/');
}

// CONFIGURAÇÕES
export async function getConfigAction() {
  let config = await prisma.config.findUnique({ where: { id: 'main' } });
  if (!config) {
    config = await prisma.config.create({
      data: {
        id: 'main',
        whatsapp: '5533999999999',
        instagram: 'blackgold_almenara',
        pixKey: '',
        pixReceiverName: 'BLACK GOLD',
        pixCity: 'ALMENARA',
        shippingFee: 15.00,
        logo: ''
      }
    });
  }
  return config;
}

export async function updateConfigAction(data: any) {
  const { id, ...rest } = data;
  const config = await prisma.config.update({
    where: { id: 'main' },
    data: { ...rest }
  });
  revalidatePath('/');
  return config;
}
