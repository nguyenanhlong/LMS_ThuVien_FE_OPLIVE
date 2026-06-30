import { ApolloServer } from '@apollo/server';
import { startServerAndCreateNextHandler } from '@as-integrations/next';
import { NextRequest } from 'next/server';

interface Book {
  id: string;
  title: string;
  author: string;
  category: string;
  description: string;
  status: 'AVAILABLE' | 'BORROWED';
}

interface Member {
  id: string;
  name: string;
  email: string;
  phone: string;
  joinDate: string;
  status: 'ACTIVE' | 'INACTIVE';
}

interface Provider {
  id: string;
  name: string;
  contact: string;
  email: string;
  phone: string;
  address: string;
}

interface BorrowRequest {
  id: string;
  bookId: string;
  userId: string;
  userName: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'RETURNED' | 'PENDING_RETURN';
  requestDate: string;
  dueDate?: string;
}

let books: Book[] = [
  { id: '1', title: 'Đắc Nhân Tâm', author: 'Dale Carnegie', category: 'Kỹ năng sống', description: 'Cuốn sách đưa ra các lời khuyên về cách thức cư xử, ứng xử và giao tiếp với mọi người để đạt được thành công trong cuộc sống.', status: 'AVAILABLE' },
  { id: '2', title: 'Nhà Giả Kim', author: 'Paulo Coelho', category: 'Tiểu thuyết', description: 'Hành trình theo đuổi giấc mơ và vận mệnh của chàng chăn cừu Santiago, mang lại nhiều triết lý sâu sắc về cuộc đời.', status: 'BORROWED' },
  { id: '3', title: 'Lược Sử Thời Gian', author: 'Stephen Hawking', category: 'Khoa học', description: 'Khám phá các câu hỏi lớn về vũ trụ, hố đen, thời gian và không gian dưới góc nhìn khoa học dễ hiểu.', status: 'AVAILABLE' },
  { id: '4', title: 'Cha Giàu Cha Nghèo', author: 'Robert Kiyosaki', category: 'Tài chính', description: 'Những bài học đắt giá về tư duy tài chính, quản lý tiền bạc và con đường dẫn đến tự do tài chính.', status: 'AVAILABLE' },
  { id: '5', title: 'Tôi Thấy Hoa Vàng Trên Cỏ Xanh', author: 'Nguyễn Nhật Ánh', category: 'Tiểu thuyết', description: 'Bức tranh làng quê Việt Nam thanh bình và câu chuyện tuổi thơ ngọt ngào, đầy cảm xúc của các nhân vật.', status: 'AVAILABLE' },
];

let members: Member[] = [
  { id: 'm1', name: 'Nguyễn Văn A', email: 'nguyenvana@email.com', phone: '0901234567', joinDate: '2026-01-15', status: 'ACTIVE' },
  { id: 'm2', name: 'Trần Thị B', email: 'tranthib@email.com', phone: '0907654321', joinDate: '2026-03-20', status: 'ACTIVE' },
];

let providers: Provider[] = [
  { id: 'p1', name: 'NXB Trẻ', contact: 'Nguyễn Văn C', email: 'nxbtre@email.com', phone: '0281234567', address: 'TP Hồ Chí Minh' },
  { id: 'p2', name: 'NXB Kim Đồng', contact: 'Lê Thị D', email: 'nxbkimdong@email.com', phone: '0241234567', address: 'Hà Nội' },
];

let borrowRequests: BorrowRequest[] = [
  { id: 'r1', bookId: '2', userId: 'm1', userName: 'Nguyễn Văn A', status: 'APPROVED', requestDate: '2026-06-20', dueDate: '2026-07-04' },
];

const typeDefs = `#graphql
  type Book {
    id: ID!
    title: String!
    author: String!
    category: String!
    description: String
    status: String!
  }

  type Member {
    id: ID!
    name: String!
    email: String!
    phone: String!
    joinDate: String!
    status: String!
  }

  type Provider {
    id: ID!
    name: String!
    contact: String!
    email: String!
    phone: String!
    address: String!
  }

  type BorrowRequest {
    id: ID!
    book: Book
    userId: ID!
    userName: String!
    status: String!
    requestDate: String!
    dueDate: String
  }

  type Query {
    books(search: String, category: String): [Book!]!
    book(id: ID!): Book
    members(search: String): [Member!]!
    member(id: ID!): Member
    providers(search: String): [Provider!]!
    provider(id: ID!): Provider
    borrowRequests: [BorrowRequest!]!
  }

  type Mutation {
    addBook(title: String!, author: String!, category: String!, description: String): Book!
    updateBook(id: ID!, title: String, author: String, category: String, description: String): Book!
    deleteBook(id: ID!): Boolean!
    addMember(name: String!, email: String!, phone: String!): Member!
    updateMember(id: ID!, name: String, email: String, phone: String, status: String): Member!
    deleteMember(id: ID!): Boolean!
    addProvider(name: String!, contact: String!, email: String!, phone: String!, address: String!): Provider!
    updateProvider(id: ID!, name: String, contact: String, email: String, phone: String, address: String): Provider!
    deleteProvider(id: ID!): Boolean!
    borrowBook(bookId: ID!, userId: ID!, userName: String!): BorrowRequest!
    updateRequestStatus(requestId: ID!, status: String!): BorrowRequest!
    returnBook(requestId: ID!): BorrowRequest!
    requestReturn(requestId: ID!): BorrowRequest!
  }
`;

const resolvers = {
  BorrowRequest: {
    book: (parent: BorrowRequest) => books.find((b) => b.id === parent.bookId),
  },
  Query: {
    books: (_: any, { search, category }: { search?: string; category?: string }) => {
      let filtered = [...books];
      if (search) {
        const q = search.toLowerCase();
        filtered = filtered.filter((b) => b.title.toLowerCase().includes(q) || b.author.toLowerCase().includes(q));
      }
      if (category && category !== 'Tất cả') filtered = filtered.filter((b) => b.category === category);
      return filtered;
    },
    book: (_: any, { id }: { id: string }) => books.find((b) => b.id === id),
    members: (_: any, { search }: { search?: string }) => {
      if (search) {
        const q = search.toLowerCase();
        return members.filter((m) => m.name.toLowerCase().includes(q) || m.email.toLowerCase().includes(q));
      }
      return members;
    },
    member: (_: any, { id }: { id: string }) => members.find((m) => m.id === id),
    providers: (_: any, { search }: { search?: string }) => {
      if (search) {
        const q = search.toLowerCase();
        return providers.filter((p) => p.name.toLowerCase().includes(q) || p.contact.toLowerCase().includes(q));
      }
      return providers;
    },
    provider: (_: any, { id }: { id: string }) => providers.find((p) => p.id === id),
    borrowRequests: () => borrowRequests,
  },
  Mutation: {
    addBook: (_: any, { title, author, category, description }: any) => {
      const exists = books.some((b) =>
        b.title.toLowerCase() === title.toLowerCase() && b.author.toLowerCase() === author.toLowerCase()
      );
      if (exists) throw new Error('Sách đã tồn tại (trùng tên và tác giả)');
      const newBook: Book = { id: String(Date.now()), title, author, category, description: description || '', status: 'AVAILABLE' };
      books.push(newBook);
      return newBook;
    },
    updateBook: (_: any, { id, title, author, category, description }: any) => {
      const book = books.find((b) => b.id === id);
      if (!book) throw new Error('Không tìm thấy sách');
      if (title !== undefined) book.title = title;
      if (author !== undefined) book.author = author;
      if (category !== undefined) book.category = category;
      if (description !== undefined) book.description = description;
      return book;
    },
    deleteBook: (_: any, { id }: { id: string }) => {
      const index = books.findIndex((b) => b.id === id);
      if (index === -1) return false;
      books.splice(index, 1);
      borrowRequests = borrowRequests.filter((r) => r.bookId !== id);
      return true;
    },
    addMember: (_: any, { name, email, phone }: any) => {
      const newMember: Member = { id: `m${Date.now()}`, name, email, phone, joinDate: new Date().toISOString().split('T')[0], status: 'ACTIVE' };
      members.push(newMember);
      return newMember;
    },
    updateMember: (_: any, { id, name, email, phone, status }: any) => {
      const member = members.find((m) => m.id === id);
      if (!member) throw new Error('Không tìm thấy độc giả');
      if (name !== undefined) member.name = name;
      if (email !== undefined) member.email = email;
      if (phone !== undefined) member.phone = phone;
      if (status !== undefined) member.status = status;
      return member;
    },
    deleteMember: (_: any, { id }: { id: string }) => {
      const index = members.findIndex((m) => m.id === id);
      if (index === -1) return false;
      members.splice(index, 1);
      return true;
    },
    addProvider: (_: any, { name, contact, email, phone, address }: any) => {
      const newProvider: Provider = { id: `p${Date.now()}`, name, contact, email, phone, address };
      providers.push(newProvider);
      return newProvider;
    },
    updateProvider: (_: any, { id, name, contact, email, phone, address }: any) => {
      const provider = providers.find((p) => p.id === id);
      if (!provider) throw new Error('Không tìm thấy nhà cung cấp');
      if (name !== undefined) provider.name = name;
      if (contact !== undefined) provider.contact = contact;
      if (email !== undefined) provider.email = email;
      if (phone !== undefined) provider.phone = phone;
      if (address !== undefined) provider.address = address;
      return provider;
    },
    deleteProvider: (_: any, { id }: { id: string }) => {
      const index = providers.findIndex((p) => p.id === id);
      if (index === -1) return false;
      providers.splice(index, 1);
      return true;
    },
    borrowBook: (_: any, { bookId, userId, userName }: any) => {
      const book = books.find((b) => b.id === bookId);
      if (!book) throw new Error('Không tìm thấy sách');
      if (book.status === 'BORROWED') throw new Error('Sách đã được mượn');
      const newRequest: BorrowRequest = {
        id: `r${Date.now()}`, bookId, userId, userName,
        status: 'PENDING', requestDate: new Date().toISOString().split('T')[0],
      };
      borrowRequests.push(newRequest);
      return newRequest;
    },
    updateRequestStatus: (_: any, { requestId, status }: any) => {
      const request = borrowRequests.find((r) => r.id === requestId);
      if (!request) throw new Error('Không tìm thấy yêu cầu');
      request.status = status;
      if (status === 'APPROVED') {
        const book = books.find((b) => b.id === request.bookId);
        if (book) book.status = 'BORROWED';
        const due = new Date();
        due.setDate(due.getDate() + 14);
        request.dueDate = due.toISOString().split('T')[0];
      }
      return request;
    },
    returnBook: (_: any, { requestId }: { requestId: string }) => {
      const request = borrowRequests.find((r) => r.id === requestId);
      if (!request) throw new Error('Không tìm thấy yêu cầu');
      if (request.status !== 'PENDING_RETURN') throw new Error('Yêu cầu trả sách chưa được gửi');
      request.status = 'RETURNED';
      const book = books.find((b) => b.id === request.bookId);
      if (book) book.status = 'AVAILABLE';
      return request;
    },
    requestReturn: (_: any, { requestId }: { requestId: string }) => {
      const request = borrowRequests.find((r) => r.id === requestId);
      if (!request) throw new Error('Không tìm thấy yêu cầu');
      if (request.status !== 'APPROVED') throw new Error('Chỉ có thể yêu cầu trả sách đang mượn');
      request.status = 'PENDING_RETURN';
      return request;
    },
  },
};

const server = new ApolloServer({ typeDefs, resolvers });
const handler = startServerAndCreateNextHandler<NextRequest>(server);

export async function GET(request: NextRequest) { return handler(request); }
export async function POST(request: NextRequest) { return handler(request); }
