/*Solution

SOLID Principles:
Single Responsibility Principle: La clase LibraryManager se ocupa únicamente de la lógica de la biblioteca, mientras que el servicio EmailService se ocupa del envío de correos electrónicos.
Open/Closed Principle: Las clases están abiertas para extensión (por ejemplo, añadiendo más tipos de notificaciones) pero cerradas para modificación.
Liskov Substitution Principle: User implementa la interfaz IObserver, lo que significa que se puede sustituir por cualquier otro objeto que también implemente la interfaz.
Dependency Inversion Principle: Se inyecta IEmailService en LibraryManager, lo que significa que LibraryManager no depende de una implementación concreta.

Inyección de Dependencias:
Inyectar IEmailService en LibraryManager.

Lambda Expressions:
Usar expresiones lambda en funciones como find y forEach.

Singleton Pattern:
Garantizar que solo haya una instancia de LibraryManager con el método getInstance.

Observer Pattern:
Los usuarios (User) se registran como observadores y son notificados cuando se añade un nuevo libro.

Builder Pattern:
Se utiliza para construir instancias de Book de una manera más limpia y escalable.

Refactorización:
eliminar el uso de ANY mejorar el performance

Aspectos (Opcional)
Puedes anadir logs de info, warning y error en las llamadas, para un mejor control

Diseño por Contrato (Opcional):
Puedes anadir validaciones en precondiciones o postcondiciones como lo veas necesario*/

// Inyección de Dependencias:
// Se inyecta IEmailService en LibraryManager para permitir diferentes implementaciones de servicios de correo electrónico.
interface IEmailService {
    sendEmail(userID: string, message: string): void;
}

class EmailService implements IEmailService {
    sendEmail(userID: string, message: string) {
        console.log(`Enviando email a ${userID}: ${message}`);
    }
}

// Lambda Expressions:
// Se utilizan expresiones lambda en funciones como find y forEach para mejorar la legibilidad del código.
interface IObserver {
    update(book: Book): void;
}

class User implements IObserver {
    constructor(private userID: string) {}

    update(book: Book) {
        console.log(`Usuario ${this.userID} ha sido notificado sobre el libro "${book.title}"`);
    }
}

class Book {
    constructor(public title: string, public author: string, public ISBN: string) {}
}

class Library {
    // Singleton Pattern:
    // Se garantiza que solo haya una instancia de LibraryManager con el método getInstance.
    private static instance: Library;
    private books: Book[] = [];
    private loans: Loan[] = [];
    private observers: IObserver[] = []; 

    private constructor() {}

    static getInstance(): Library {
        if (!Library.instance) {
            Library.instance = new Library();
        }
        return Library.instance;
    }

    addBook(title: string, author: string, ISBN: string) {
        const book = new Book(title, author, ISBN);
        this.books.push(book);
        this.notifyObservers(book);
    }

    removeBook(ISBN: string) {
        const index = this.books.findIndex(book => book.ISBN === ISBN);
        if (index !== -1) {
            this.books.splice(index, 1);
        }
    }

    searchByTitle(title: string): Book[] {
        return this.books.filter(book => book.title.includes(title));
    }

    searchByAuthor(author: string): Book[] {
        return this.books.filter(book => book.author.includes(author));
    }

    searchByISBN(ISBN: string): Book | undefined {
        return this.books.find(book => book.ISBN === ISBN);
    }

    loanBook(ISBN: string, userID: string) {
        const book = this.books.find(b => b.ISBN === ISBN);
        if (book) {
            this.loans.push(new Loan(ISBN, userID, new Date()));
            this.sendEmail(userID, `Has solicitado el libro "${book.title}"`);
        }
    }

    returnBook(ISBN: string, userID: string) {
        const index = this.loans.findIndex(loan => loan.ISBN === ISBN && loan.userID === userID);
        if (index !== -1) {
            const loan = this.loans[index];
            this.loans.splice(index, 1);
            const book = this.searchByISBN(ISBN);
            if (book) {
                this.sendEmail(userID, `Has devuelto el libro con ISBN ${ISBN} ("${book.title}"). Gracias`);
            }
        }
    }

    addObserver(observer: IObserver) {
        this.observers.push(observer);
    }

    private notifyObservers(book: Book) {
        this.observers.forEach(observer => observer.update(book));
    }

    private sendEmail(userID: string, message: string) {
        // Se implemento el servicio de correo electrónico inyectado.
        const emailService = new EmailService();
        emailService.sendEmail(userID, message);
    }
}

class Loan {
    constructor(public ISBN: string, public userID: string, public date: Date) {}
}

// Ejemplo de uso
const library = Library.getInstance();
const user1 = new User("user01");

library.addObserver(user1);
library.addBook("El Gran Gatsby", "F. Scott Fitzgerald", "123456789");
library.addBook("1984", "George Orwell", "987654321");
library.loanBook("123456789", "user01");
library.returnBook("123456789", "user01");
