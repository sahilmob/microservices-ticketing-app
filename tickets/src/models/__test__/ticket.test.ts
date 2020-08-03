import { Ticket } from "../ticket";

it("implements optimistic concurrency control", async (done) => {
  const newTicket = Ticket.build({
    price: 10,
    title: "test",
    userId: "abc",
  });

  await newTicket.save();

  const existingTicket1 = await Ticket.findById(newTicket.id);
  const existingTicket2 = await Ticket.findById(newTicket.id);

  existingTicket1!.set({
    price: 10,
  });

  existingTicket2!.set({
    price: 20,
  });

  await existingTicket1!.save();

  // sometimes it dosn't work
  // expect(async () => {
  //   await existingTicket2!.save();
  // }).toThrow();

  try {
    await existingTicket2!.save();
  } catch (error) {
    return done();
  }

  throw new Error(
    "It didn't throw and error when trying to update a ticket with outdated version"
  );
});

it("increment the version number on multiple saves", async () => {
  const newTicket = Ticket.build({
    price: 10,
    title: "test",
    userId: "abc",
  });

  await newTicket.save();

  expect(newTicket.version).toBe(0);

  await newTicket!.save();

  expect(newTicket!.version).toBe(1);

  await newTicket!.save();

  expect(newTicket!.version).toBe(2);
});
