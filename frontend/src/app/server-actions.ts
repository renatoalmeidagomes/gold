'use server';
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { mkdir, readFile, writeFile } from "fs/promises";
import path from "path";
import { randomUUID } from "crypto";

type UserRole = 'CLIENTE' | 'ADMIN';

// UPLOAD DE IMAGENS
export async function uploadImageActionV3(formData: FormData) {
  console.log("Executando: uploadImageActionV3");
  try {
    const file = formData.get('file') as File;
    if (!file) throw new Error("Arquivo não encontrado");

    const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
    const storedName = `${Date.now()}-${randomUUID()}-${safeName}`;
    const uploadsDir = path.resolve(process.cwd(), "..", "backend", "storage", "uploads");
    const manifestDir = path.resolve(process.cwd(), "..", "backend", "storage");
    const manifestPath = path.join(manifestDir, "uploaded-files.json");
    const filePath = path.join(uploadsDir, storedName);

    await mkdir(uploadsDir, { recursive: true });
    await mkdir(manifestDir, { recursive: true });
    await writeFile(filePath, Buffer.from(await file.arrayBuffer()));

    const fileUrl = `/uploads/${storedName}`;
    const newEntry = {
      id: randomUUID(),
      originalName: file.name,
      storedName,
      mimeType: file.type || "application/octet-stream",
      size: file.size,
      url: fileUrl,
      createdAt: new Date().toISOString()
    };

    let uploadedFiles: any[] = [];
    try {
      const currentManifest = await readFile(manifestPath, "utf-8");
      uploadedFiles = JSON.parse(currentManifest);
      if (!Array.isArray(uploadedFiles)) uploadedFiles = [];
    } catch {
      uploadedFiles = [];
    }

    uploadedFiles.push(newEntry);
    await writeFile(manifestPath, JSON.stringify(uploadedFiles, null, 2), "utf-8");

    return fileUrl;
  } catch (error) {
    console.error("Erro no upload:", error);
    throw error;
  }
}

// PRODUTOS
export async function getProductsActionV3() {
  try {
    return await prisma.product.findMany({
      orderBy: { createdAt: 'desc' }
    });
  } catch (error) {
    console.error("Erro ao buscar produtos:", error);
    return [];
  }
}

export async function addProductActionV3(data: any) {
  console.log("Executando: addProductActionV3");
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


// CATEGORIAS
export async function getCategoriesAction() {
  try {
    return await prisma.category.findMany({
      orderBy: { name: 'asc' }
    });
  } catch (error) {
    console.error("Erro ao buscar categorias:", error);
    return [];
  }
}

export async function addCategoryAction(name: string) {
  try {
    const normalizedName = name.trim();
    if (!normalizedName) throw new Error("Nome da categoria é obrigatório");

    const existing = await prisma.category.findFirst({
      where: { name: { equals: normalizedName, mode: 'insensitive' } }
    });
    if (existing) return existing;

    const category = await prisma.category.create({
      data: { name: normalizedName }
    });

    revalidatePath('/admin');
    return category;
  } catch (error) {
    console.error("Erro ao adicionar categoria:", error);
    throw error;
  }
}

export async function updateCategoryAction(id: string, name: string) {
  try {
    const normalizedName = name.trim();
    if (!normalizedName) throw new Error("Nome da categoria é obrigatório");

    const current = await prisma.category.findUnique({ where: { id } });
    if (!current) throw new Error("Categoria não encontrada");

    const duplicate = await prisma.category.findFirst({
      where: {
        id: { not: id },
        name: { equals: normalizedName, mode: 'insensitive' }
      }
    });
    if (duplicate) throw new Error("Já existe uma categoria com esse nome");

    const [category] = await prisma.$transaction([
      prisma.category.update({
        where: { id },
        data: { name: normalizedName }
      }),
      prisma.product.updateMany({
        where: { category: current.name },
        data: { category: normalizedName }
      })
    ]);

    revalidatePath('/admin');
    revalidatePath('/');
    return category;
  } catch (error) {
    console.error("Erro ao atualizar categoria:", error);
    throw error;
  }
}

export async function deleteCategoryAction(id: string) {
  try {
    const category = await prisma.category.findUnique({ where: { id } });
    if (!category) return;

    const productsUsingCategory = await prisma.product.count({
      where: { category: category.name }
    });

    if (productsUsingCategory > 0) {
      throw new Error("Não é possível excluir uma categoria já utilizada em produtos");
    }

    await prisma.category.delete({ where: { id } });
    revalidatePath('/admin');
  } catch (error) {
    console.error("Erro ao excluir categoria:", error);
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
          storeName: 'Ecommerce',
          whatsapp: '5533999999999',
          instagram: 'ecommerce_almenara',
          addressLine1: '',
          addressLine2: '',
          addressLine3: '',
          pixKey: '',
          pixReceiverName: 'ECOMMERCE',
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
    const email = String(data?.email || '').trim().toLowerCase();
    if (!email) throw new Error("E-mail é obrigatório");
    if (!data?.password) throw new Error("Senha é obrigatória");

    return await prisma.user.create({
      data: {
        name: String(data?.name || '').trim(),
        email,
        username: email,
        phone: String(data?.phone || '').trim(),
        address: String(data?.address || '').trim(),
        password: String(data.password),
        role: 'CLIENTE',
        isActive: true
      }
    });
  } catch (error) {
    console.error("Erro ao registrar usuário:", error);
    throw error;
  }
}

export async function loginUserAction(login: string, pass: string, requiredRole?: UserRole) {
  try {
    const normalizedLogin = String(login || '').trim().toLowerCase();
    if (!normalizedLogin || !pass) return null;

    return await prisma.user.findFirst({
      where: {
        AND: [
          {
            OR: [
              { email: normalizedLogin },
              { username: normalizedLogin }
            ]
          },
          { password: pass },
          { isActive: true },
          requiredRole ? { role: requiredRole } : {}
        ]
      }
    });
  } catch (error) {
    console.error("Erro no login:", error);
    return null;
  }
}

export async function createUserByAdminAction(data: any) {
  try {
    const email = String(data?.email || '').trim().toLowerCase();
    const role = String(data?.role || 'CLIENTE').toUpperCase() as UserRole;

    if (!email) throw new Error("E-mail é obrigatório");
    if (!data?.password) throw new Error("Senha é obrigatória");
    if (role !== 'CLIENTE' && role !== 'ADMIN') throw new Error("Tipo de usuário inválido");

    const desiredUsername = String(data?.username || '').trim().toLowerCase();
    const username = role === 'CLIENTE' ? email : (desiredUsername || email);

    return await prisma.user.create({
      data: {
        name: String(data?.name || '').trim(),
        email,
        username,
        phone: String(data?.phone || '').trim(),
        address: String(data?.address || '').trim(),
        password: String(data.password),
        role,
        isActive: true
      }
    });
  } catch (error) {
    console.error("Erro ao cadastrar usuário no admin:", error);
    throw error;
  }
}

export async function updateUserByAdminAction(id: string, data: any) {
  try {
    const userId = String(id || '').trim();
    if (!userId) throw new Error("ID do usuário é obrigatório");

    const currentUser = await prisma.user.findUnique({ where: { id: userId } });
    if (!currentUser) throw new Error("Usuário não encontrado");

    const email = String(data?.email || '').trim().toLowerCase();
    const role = String(data?.role || currentUser.role || 'CLIENTE').toUpperCase() as UserRole;
    if (!email) throw new Error("E-mail é obrigatório");
    if (role !== 'CLIENTE' && role !== 'ADMIN') throw new Error("Tipo de usuário inválido");

    const desiredUsername = String(data?.username || '').trim().toLowerCase();
    const username = role === 'CLIENTE' ? email : (desiredUsername || email);

    const passwordInput = String(data?.password || '').trim();

    const updated = await prisma.user.update({
      where: { id: userId },
      data: {
        name: String(data?.name || '').trim(),
        email,
        username,
        phone: String(data?.phone || '').trim(),
        address: String(data?.address || '').trim(),
        role,
        isActive: data?.isActive === false ? false : true,
        ...(passwordInput ? { password: passwordInput } : {})
      }
    });

    revalidatePath('/admin');
    return updated;
  } catch (error) {
    console.error("Erro ao atualizar usuário no admin:", error);
    throw error;
  }
}

export async function setUserActiveStatusAction(id: string, isActive: boolean) {
  try {
    const userId = String(id || '').trim();
    if (!userId) throw new Error("ID do usuário é obrigatório");

    const currentUser = await prisma.user.findUnique({ where: { id: userId } });
    if (!currentUser) throw new Error("Usuário não encontrado");

    await prisma.user.update({
      where: { id: userId },
      data: { isActive }
    });

    revalidatePath('/admin');
  } catch (error) {
    console.error("Erro ao alterar status do usuário:", error);
    throw error;
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




