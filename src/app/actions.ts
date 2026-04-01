'use server';
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { put } from "@vercel/blob";

// UPLOAD DE IMAGENS
export async function uploadImageAction(formData: FormData) {
  try {
    const file = formData.get('file') as File;
    if (!file) throw new Error("Arquivo não encontrado");

    const blob = await put(file.name, file, {
      access: 'public', 
      token: process.env.BLOB_READ_WRITE_TOKEN
    });

    return blob.url;
  } catch (error) {
    console.error("Erro no upload:", error);
    throw error;
  }
}

// PRODUTOS
export async function getProductsAction() {
  try {
    return await prisma.product.findMany({
      orderBy: { createdAt: 'desc' }
    });
  } catch (error) {
    console.error("Erro ao buscar produtos:", error);
    return [];
  }
}

export async function addProductAction(data: any) {
  try {
    const { id, ...rest } = data;
    const product = await prisma.product.create({
      data: { ...rest }
    });
    revalidatePath('/');
    return product;
  } catch (error) {
    console.error("Erro ao adicionar produto:", error);
    throw error;
  }
}

export async function updateProductAction(id: string, data: any) {
  try {
    const product = await prisma.product.update({
      where: { id },
      data: { ...data }
    });
    revalidatePath('/');
    return product;
  } catch (error) {
    console.error("Erro ao atualizar produto:", error);
    throw error;
  }
}

export async function deleteProductAction(id: string) {
  try {
    await prisma.product.delete({ where: { id } });
    revalidatePath('/');
  } catch (error) {
    console.error("Erro ao deletar produto:", error);
    throw error;
  }
}

// CONFIGURAÇÕES
export async function getConfigAction() {
  try {
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
  } catch (error) {
    console.error("Erro ao buscar config:", error);
    return null;
  }
}

export async function updateConfigAction(data: any) {
  try {
    const { id, ...rest } = data;
    const config = await prisma.config.update({
      where: { id: 'main' },
      data: { ...rest }
    });
    revalidatePath('/');
    return config;
  } catch (error) {
    console.error("Erro ao atualizar config:", error);
    throw error;
  }
}

// USUÁRIOS
export async function registerUserAction(data: any) {
  try {
    const { id, ...rest } = data;
    return await prisma.user.create({ data: { ...rest } });
  } catch (error) {
    console.error("Erro ao registrar usuário:", error);
    throw error;
  }
}

export async function loginUserAction(email: string, pass: string) {
  try {
    return await prisma.user.findFirst({
      where: { email, password: pass }
    });
  } catch (error) {
    console.error("Erro no login:", error);
    return null;
  }
}

export async function getUsersAction() {
  try {
    return await prisma.user.findMany({
      orderBy: { createdAt: 'desc' }
    });
  } catch (error) {
    console.error("Erro ao buscar usuários:", error);
    return [];
  }
}

// PEDIDOS
export async function createOrderAction(data: any) {
  try {
    const { id, ...rest } = data;
    const order = await prisma.order.create({ data: { ...rest } });
    revalidatePath('/admin');
    return order;
  } catch (error) {
    console.error("Erro ao criar pedido:", error);
    throw error;
  }
}

export async function getOrdersAction() {
  try {
    return await prisma.order.findMany({
      orderBy: { createdAt: 'desc' }
    });
  } catch (error) {
    console.error("Erro ao buscar pedidos:", error);
    return [];
  }
}

export async function updateOrderStatusAction(id: string, status: string) {
  try {
    await prisma.order.update({
      where: { id },
      data: { status }
    });
    revalidatePath('/admin');
  } catch (error) {
    console.error("Erro ao atualizar status:", error);
    throw error;
  }
}

export async function confirmPaymentAction(id: string, paymentDetails: any) {
  try {
    await prisma.order.update({
      where: { id },
      data: { status: 'Pago', paymentDetails }
    });
    revalidatePath('/admin');
  } catch (error) {
    console.error("Erro ao confirmar pagamento:", error);
    throw error;
  }
}
