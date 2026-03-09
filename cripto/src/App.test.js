import { render, screen } from "@testing-library/react";
import App from "./App";

test("renderiza o nome da aplicação", () => {
  render(<App />);
  const title = screen.getByText(/CriptoHouse Invest/i);
  expect(title).toBeInTheDocument();
});