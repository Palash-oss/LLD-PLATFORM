import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const problems = [
  {
    title: 'Parking Lot System',
    slug: 'parking-lot',
    difficulty: 'medium',
    statement:
      'Design a parking lot system that supports multiple vehicle types (motorcycle, car, truck), multiple floors, spot allocation based on vehicle size, ticketing on entry, and pricing that varies by duration and vehicle type.',
    functionalRequirements: JSON.stringify([
      'Support multiple vehicle types: motorcycle, car, truck',
      'Allocate the nearest available spot of the correct size',
      'Issue a ticket on vehicle entry with timestamp',
      'Calculate fee on exit based on duration and vehicle type',
      'Track availability of spots in real-time',
    ]),
    nonFunctionalRequirements: JSON.stringify([
      'Pricing strategy must be swappable without modifying spot allocation logic',
      'Design should support adding new vehicle types without breaking existing behavior',
    ]),
    rubric: {
      expectedClasses: JSON.stringify(['Vehicle', 'ParkingSpot', 'ParkingLot', 'Ticket', 'PricingStrategy']),
      expectedPatterns: JSON.stringify(['Strategy', 'Factory', 'Singleton']),
      exampleClassDiagram: `classDiagram
  ParkingLot --> ParkingSpot
  ParkingSpot --> Vehicle
  ParkingLot --> PricingStrategy
  Ticket --> Vehicle
  ParkingSpot : +allocate(Vehicle)
  ParkingSpot : +release()`,
      dimensions: JSON.stringify([
        { name: 'Responsibility Separation', description: 'Is pricing logic separate from spot allocation? Does each class have a single clear responsibility?' },
        { name: 'Extensibility', description: 'Can new vehicle types or pricing models be added without modifying existing classes?' },
        { name: 'Naming & Clarity', description: 'Are class and method names self-explanatory and consistent?' },
        { name: 'Edge Case Handling', description: 'Does the design address: full lot, invalid vehicle type, concurrent entry?' },
      ]),
    },
  },
  {
    title: 'Elevator System',
    slug: 'elevator',
    difficulty: 'hard',
    statement:
      'Design an elevator system for a building with multiple elevators. The system must handle floor requests from inside and outside elevators, schedule which elevator responds to each request, and manage direction and state for each elevator independently.',
    functionalRequirements: JSON.stringify([
      'Handle external floor requests (up/down buttons on each floor)',
      'Handle internal floor requests (buttons inside elevator)',
      'Dispatch the most suitable elevator to each request',
      'Track each elevator\'s current floor, direction, and door state',
      'Support multiple elevators operating simultaneously',
    ]),
    nonFunctionalRequirements: JSON.stringify([
      'Scheduling logic must be separate from individual elevator state management',
      'Adding a new scheduling algorithm should not require changing the Elevator class',
    ]),
    rubric: {
      expectedClasses: JSON.stringify(['Elevator', 'ElevatorController', 'Request', 'Scheduler', 'Floor']),
      expectedPatterns: JSON.stringify(['Strategy', 'State', 'Observer']),
      exampleClassDiagram: `classDiagram
  Building --> ElevatorController
  ElevatorController o-- Elevator
  ElevatorController --> Scheduler
  Elevator --> Request
  Elevator : +moveUp()
  Elevator : +moveDown()`,
      dimensions: JSON.stringify([
        { name: 'Responsibility Separation', description: 'Is scheduling logic separate from Elevator state? Does ElevatorController not own scheduling decisions?' },
        { name: 'State Machine Design', description: 'Is elevator state (idle, moving up, moving down, door open) modeled explicitly rather than with boolean flags?' },
        { name: 'Extensibility', description: 'Can a new scheduling algorithm (e.g. priority-based) be swapped in without touching Elevator class?' },
        { name: 'Edge Case Handling', description: 'Are concurrent requests, full capacity, and elevator-at-target-floor cases addressed?' },
      ]),
    },
  },
  {
    title: 'Vending Machine',
    slug: 'vending-machine',
    difficulty: 'easy',
    statement:
      'Design a vending machine that manages inventory, accepts payment, dispenses items, and handles state transitions including idle, item selected, payment inserted, dispensing, and out-of-stock.',
    functionalRequirements: JSON.stringify([
      'Display available items with prices',
      'Accept coin/note payment',
      'Dispense selected item if payment is sufficient',
      'Return change if overpaid',
      'Handle out-of-stock items gracefully',
      'Allow cancellation and refund before dispensing',
    ]),
    nonFunctionalRequirements: JSON.stringify([
      'State transitions must be explicit — no pile of boolean flags',
      'Adding a new state should not require modifying existing state logic',
    ]),
    rubric: {
      expectedClasses: JSON.stringify(['VendingMachine', 'Item', 'Inventory', 'PaymentProcessor', 'State']),
      expectedPatterns: JSON.stringify(['State', 'Singleton']),
      exampleClassDiagram: `classDiagram
  VendingMachine --> State
  VendingMachine --> Inventory
  Inventory --> Item
  State : +selectItem()
  State : +insertCoin()`,
      dimensions: JSON.stringify([
        { name: 'State Machine Design', description: 'Are states (Idle, ItemSelected, PaymentInserted, Dispensing) modeled as explicit objects or enum-driven, not boolean flags?' },
        { name: 'Responsibility Separation', description: 'Is payment logic separate from inventory management and state transitions?' },
        { name: 'Edge Case Handling', description: 'Are out-of-stock, insufficient payment, and cancellation scenarios handled?' },
        { name: 'Extensibility', description: 'Can a new state or payment method be added without modifying VendingMachine core logic?' },
      ]),
    },
  },
  {
    title: 'Library Management System',
    slug: 'library-management',
    difficulty: 'easy',
    statement:
      'Design a library management system that handles books, members, borrowing and returning books, holds/reservations, and late fee calculation.',
    functionalRequirements: JSON.stringify([
      'Members can search and borrow available books',
      'Members can return books',
      'Members can place holds on checked-out books',
      'Calculate late fees for overdue returns',
      'Track each member\'s borrowing history',
      'Librarian can add/remove books from the catalog',
    ]),
    nonFunctionalRequirements: JSON.stringify([
      'Fee calculation policy must be separate from borrowing logic',
      'Catalog management must be separate from member borrowing records',
    ]),
    rubric: {
      expectedClasses: JSON.stringify(['Book', 'Member', 'Catalog', 'BorrowRecord', 'FeePolicy', 'Library']),
      expectedPatterns: JSON.stringify(['Strategy', 'Repository', 'Factory']),
      exampleClassDiagram: `classDiagram
  Library --> Catalog
  Library --> Member
  Catalog --> Book
  Member --> BorrowRecord
  BorrowRecord --> Book
  Library : +borrowBook(memberId, bookId)`,
      dimensions: JSON.stringify([
        { name: 'Responsibility Separation', description: 'Is Catalog separate from Member borrowing records? Is FeePolicy decoupled from BorrowRecord?' },
        { name: 'Extensibility', description: 'Can fee policies be changed (e.g. per-day vs flat rate) without modifying core borrowing logic?' },
        { name: 'Naming & Clarity', description: 'Are entity names clear and do they map to real-world library concepts?' },
        { name: 'Edge Case Handling', description: 'Are scenarios like: book not available, member limit exceeded, and overdue returns addressed?' },
      ]),
    },
  },
  {
    title: 'Movie Ticket Booking System',
    slug: 'movie-booking',
    difficulty: 'medium',
    statement:
      'Design a movie ticket booking system that manages shows, seats, concurrent seat selection with temporary holds, and payment. The system must prevent double-booking under concurrent access.',
    functionalRequirements: JSON.stringify([
      'Browse movies and available shows',
      'Select seats for a show',
      'Temporarily hold selected seats during payment (5-minute expiry)',
      'Confirm booking after successful payment',
      'Release held seats on payment failure or timeout',
      'Support multiple screens and seat categories (regular, premium)',
    ]),
    nonFunctionalRequirements: JSON.stringify([
      'Seat hold/expiry must be its own responsibility — not bundled into Booking',
      'Design must explicitly handle concurrent booking attempts on the same seat',
    ]),
    rubric: {
      expectedClasses: JSON.stringify(['Movie', 'Show', 'Seat', 'SeatHold', 'Booking', 'Payment', 'Screen']),
      expectedPatterns: JSON.stringify(['Strategy', 'Factory', 'Observer']),
      exampleClassDiagram: `classDiagram
  BookingSystem --> Show
  Show --> Seat
  BookingSystem --> SeatHold
  BookingSystem --> Payment
  SeatHold --> Seat
  SeatHold : +isExpired()`,
      dimensions: JSON.stringify([
        { name: 'Concurrency Handling', description: 'Is the seat hold/expiry responsibility explicitly modeled? How does the design prevent double-booking?' },
        { name: 'Responsibility Separation', description: 'Is SeatHold separate from Booking? Is payment logic decoupled from seat allocation?' },
        { name: 'Extensibility', description: 'Can new seat categories or payment methods be added without changing core booking flow?' },
        { name: 'Edge Case Handling', description: 'Are timeout expiry, payment failure, and already-booked seat scenarios addressed?' },
      ]),
    },
  },
];

async function main() {
  console.log('Seeding database with 5 LLD problems (with Mermaid example class diagrams)...\n');

  for (const p of problems) {
    const { rubric, ...problemData } = p;

    // Upsert so seeds can update exampleClassDiagram if problem exists
    const existing = await prisma.problem.findUnique({ where: { slug: p.slug } });
    if (existing) {
      await prisma.rubric.update({
        where: { problemId: existing.id },
        data: { exampleClassDiagram: rubric.exampleClassDiagram },
      });
      console.log(`  Updated exampleClassDiagram for: ${p.title}`);
    } else {
      await prisma.problem.create({
        data: {
          ...problemData,
          rubric: {
            create: rubric,
          },
        },
      });
      console.log(`  Created: ${p.title} (${p.difficulty})`);
    }
  }

  console.log('\nSeeding complete!');
}

main()
  .catch((e) => {
    console.error('Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
