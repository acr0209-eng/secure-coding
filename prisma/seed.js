const bcrypt = require("bcryptjs");
const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

const products = [
  {
    title: "거의 새 노트북 거치대",
    description: "알루미늄 접이식 거치대입니다. 재택 수업 때 두 달 정도 사용했습니다.",
    price: 18000,
    category: "디지털",
    location: "서울 강남구",
    imageUrl:
      "https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?auto=format&fit=crop&w=900&q=80",
  },
  {
    title: "기계식 키보드 갈축",
    description: "윤활 완료된 87키 키보드입니다. 키캡 사용감은 조금 있습니다.",
    price: 42000,
    category: "디지털",
    location: "경기 성남시",
    imageUrl:
      "https://images.unsplash.com/photo-1587829741301-dc798b83add3?auto=format&fit=crop&w=900&q=80",
  },
  {
    title: "화이트 책상 의자",
    description: "등받이 상태 좋고 바퀴도 부드럽습니다. 직접 가져가실 분 우대합니다.",
    price: 35000,
    category: "가구",
    location: "서울 마포구",
    imageUrl:
      "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?auto=format&fit=crop&w=900&q=80",
  },
  {
    title: "보안 입문 도서 세트",
    description: "웹 보안, 네트워크 기초, 시큐어 코딩 책 3권 묶음입니다.",
    price: 27000,
    category: "도서",
    location: "인천 연수구",
    imageUrl:
      "https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?auto=format&fit=crop&w=900&q=80",
  },
];

async function main() {
  const adminPassword = await bcrypt.hash("Admin01!Aa", 12);
  const userPassword = await bcrypt.hash("User01!Aa", 12);

  const admin = await prisma.user.upsert({
    where: { email: "admin@example.com" },
    update: { walletBalance: 500000 },
    create: {
      name: "관리자",
      email: "admin@example.com",
      passwordHash: adminPassword,
      walletBalance: 500000,
      role: "ADMIN",
    },
  });

  const seller = await prisma.user.upsert({
    where: { email: "seller@example.com" },
    update: { walletBalance: 120000 },
    create: {
      name: "테스트 판매자",
      email: "seller@example.com",
      passwordHash: userPassword,
      walletBalance: 120000,
      role: "USER",
    },
  });

  const buyer = await prisma.user.upsert({
    where: { email: "buyer@example.com" },
    update: { walletBalance: 280000 },
    create: {
      name: "안전 구매자",
      email: "buyer@example.com",
      passwordHash: userPassword,
      walletBalance: 280000,
      role: "USER",
    },
  });

  for (const product of products) {
    const exists = await prisma.product.findFirst({
      where: { title: product.title },
      select: { id: true },
    });

    if (!exists) {
      await prisma.product.create({
        data: {
          ...product,
          sellerId: seller.id,
        },
      });
    }
  }

  const existingReport = await prisma.report.findFirst({
    where: {
      reporterId: seller.id,
      reportedUserId: admin.id,
      reason: "SCAM",
    },
    select: { id: true },
  });

  if (!existingReport) {
    await prisma.report.create({
      data: {
        reason: "SCAM",
        details: "시세보다 과하게 낮은 가격으로 외부 결제를 유도한다는 신고입니다.",
        reporterId: seller.id,
        reportedUserId: admin.id,
      },
    });
  }

  const sampleTransfer = await prisma.transfer.findFirst({
    where: {
      senderId: buyer.id,
      receiverId: seller.id,
      memo: "직거래 전 예약금",
    },
    select: { id: true },
  });

  if (!sampleTransfer) {
    await prisma.transfer.create({
      data: {
        amount: 10000,
        memo: "직거래 전 예약금",
        senderId: buyer.id,
        receiverId: seller.id,
      },
    });
  }
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
