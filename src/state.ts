export interface State {
    items: Item[];
  }
  
  export interface Item {
    title: string;
    completed: boolean;
    timestamp: number;
  }
  
  const initialState: State = { items: [] };
  export default initialState;
  